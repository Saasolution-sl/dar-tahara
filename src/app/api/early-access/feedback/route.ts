import { NextRequest, NextResponse } from "next/server";
import { clientIpFromHeaders, rateLimit } from "@/lib/mailing-list";
import { isFeedbackReason, isOpaqueToken } from "@/lib/early-access/funnel";
import {
  recordFunnelEvent,
  signupSessionByFeedbackToken,
} from "@/lib/early-access/funnel-server";
import { updateAbandonedMauticStatus } from "@/lib/early-access/abandonment";
import { serviceInsertIgnoreDuplicates, serviceUpdate } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  if (!rateLimit(`ea-feedback:${ip}`).allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  const body = await req.json().catch(() => null) as {
    token?: unknown;
    reason?: unknown;
    comments?: unknown;
    optOut?: unknown;
  } | null;
  if (!body || !isOpaqueToken(body.token)) {
    return NextResponse.json({ ok: false, error: "invalid_link" }, { status: 400 });
  }
  const session = await signupSessionByFeedbackToken(body.token);
  if (!session) return NextResponse.json({ ok: false, error: "invalid_link" }, { status: 404 });

  try {
    if (body.optOut === true) {
      const now = new Date().toISOString();
      await serviceUpdate("early_access_signup_sessions", `id=eq.${session.id}`, {
        status: "opted_out",
        reminder_consent: false,
        opted_out_at: now,
        resume_token_hash: null,
        resume_token_expires_at: null,
        reminder_claimed_at: null,
        reminder_claimed_number: null,
      });
      void updateAbandonedMauticStatus(session, "opted_out").catch(() => {});
      return NextResponse.json({ ok: true, optedOut: true });
    }

    if (!isFeedbackReason(body.reason)) {
      return NextResponse.json({ ok: false, error: "reason_required" }, { status: 400 });
    }
    const comments = typeof body.comments === "string"
      ? body.comments.trim().slice(0, 2000) || null
      : null;
    await serviceInsertIgnoreDuplicates(
      "early_access_abandonment_feedback",
      { signup_session_id: session.id, reason: body.reason, comments },
      "signup_session_id",
    );
    await recordFunnelEvent(session.id, {
      eventName: "early_access_feedback_submitted",
      idempotencyKey: "feedback:submitted",
      stepId: session.current_step,
      stepIndex: session.current_step_index,
      metadata: { reason: body.reason },
    });
    return NextResponse.json({ ok: true });
  } catch {
    console.error("[early-access/feedback] failed");
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
