import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { validateRefundRequest } from "@/lib/refunds";
import { createRefund } from "@/lib/stripe";
import { isServiceRoleConfigured, serviceSelect, serviceUpsert, serviceUpdate, serviceInsert } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

type AssessmentRow = {
  id: string;
  customer_id: string;
  stripe_payment_intent_id: string | null;
  assessment_price_cents: number;
  payment_status: string;
  refunds: Array<{ amount_cents: number; status: string }>;
};

export async function GET() {
  const auth = await authorizeApi(["manager", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const assessments = await serviceSelect(
    "home_assessments?payment_status=in.(paid,partially_refunded)&stripe_payment_intent_id=not.is.null&select=id,reference,assessment_price_cents,payment_status,created_at,customers(full_name,email),refunds(amount_cents,status,created_at)&order=created_at.desc&limit=100",
  );
  return NextResponse.json({ assessments });
}

/** Manager/admin refund confirmation (full or partial) with audit logging. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["manager", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isServiceRoleConfigured() || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const assessmentId = body?.assessmentId;
  if (typeof assessmentId !== "string") return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const rows = await serviceSelect<AssessmentRow[]>(
    `home_assessments?id=eq.${encodeURIComponent(assessmentId)}&select=id,customer_id,stripe_payment_intent_id,assessment_price_cents,payment_status,refunds(amount_cents,status)&limit=1`,
  );
  const assessment = rows[0];
  if (!assessment) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const alreadyRefundedCents = (assessment.refunds || [])
    .filter((refund) => ["pending", "succeeded"].includes(refund.status))
    .reduce((sum, refund) => sum + refund.amount_cents, 0);
  const refundableCents = Math.max(0, assessment.assessment_price_cents - alreadyRefundedCents);
  const validation = validateRefundRequest(body, {
    paidCents: refundableCents,
    paymentStatus: assessment.payment_status,
    paymentIntentId: assessment.stripe_payment_intent_id,
  });
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

  try {
    const refund = await createRefund({
      paymentIntentId: validation.value.paymentIntentId,
      amountCents: validation.value.amountCents,
      reason: validation.value.reason,
      internalReason: validation.value.note,
      idempotencyKey: `management_refund_${assessmentId}_${randomUUID()}`,
    });

    const fully = !validation.value.amountCents || validation.value.amountCents >= refundableCents;
    await serviceUpsert(
      "refunds",
      {
        stripe_refund_id: refund.id,
        stripe_charge_id: refund.charge,
        stripe_payment_intent_id: refund.payment_intent,
        assessment_id: assessment.id,
        customer_id: assessment.customer_id,
        amount_cents: refund.amount,
        currency: refund.currency,
        reason: validation.value.reason ?? null,
        internal_note: validation.value.note ?? null,
        status: refund.status === "succeeded" ? "succeeded" : "pending",
        source: auth.context.roles.includes("manager") ? "manager" : "admin",
        created_by: auth.context.user.id,
        approved_by_manager_user_id: auth.context.roles.includes("manager") ? auth.context.user.id : null,
        approved_at: new Date().toISOString(),
      },
      "stripe_refund_id",
    );
    await serviceUpdate("home_assessments", `id=eq.${assessment.id}`, {
      payment_status: fully ? "refunded" : "partially_refunded",
    });
    await serviceInsert("assessment_events", {
      assessment_id: assessment.id,
      event_type: fully ? "refunded" : "partially_refunded",
      actor_type: auth.context.roles.includes("manager") ? "manager" : "admin",
      actor_reference: auth.context.user.id,
      note: validation.value.note ?? null,
    });
    await serviceInsert("audit_logs", {
      actor_user_id: auth.context.user.id,
      action: "refund_confirmed",
      resource_type: "home_assessment",
      resource_id: assessment.id,
      previous_value: { paymentStatus: assessment.payment_status },
      new_value: { stripeRefundId: refund.id, amountCents: refund.amount, fullyRefunded: fully },
    });

    return NextResponse.json({ ok: true, refundId: refund.id, amountCents: refund.amount, status: refund.status });
  } catch (error) {
    console.error("[admin-refund]", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "refund_failed" }, { status: 502 });
  }
}
