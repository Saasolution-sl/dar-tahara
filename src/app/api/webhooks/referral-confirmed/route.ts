import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { secureTokenEqual } from "@/lib/whatsapp/security";
import {
  syncReferralRewardsFor,
  type ReferrerIdentifier,
} from "@/lib/early-access/referral-rewards-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Referral-confirmed webhook.
 *
 * Recomputes a referrer's reward state (discount percent, euros saved, next
 * tier, personal link, progress bar) and writes it to their Mautic contact so
 * the reward emails have live numbers to print.
 *
 * Referrals originating INSIDE this app do not need this endpoint: verifying a
 * referred lead's email calls creditReferralIfEligible(), which pushes the same
 * fields directly. This exists for the external referral/e-commerce system,
 * which owns confirmations we never see.
 *
 * Auth matches the other machine-to-machine routes (see /api/jobs/early-access):
 * a bearer shared secret, or an authenticated admin session for manual replays.
 */
async function authorized(req: NextRequest): Promise<boolean> {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
  return (
    (await isAdminAuthorized()) ||
    secureTokenEqual(bearer, process.env.REFERRAL_WEBHOOK_SECRET) ||
    secureTokenEqual(bearer, process.env.EARLY_ACCESS_JOB_SECRET)
  );
}

export async function POST(req: NextRequest) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const identifier: ReferrerIdentifier = {
    leadId: stringOrNull(body.leadId ?? body.lead_id),
    referralCode: stringOrNull(body.referralCode ?? body.referral_code),
    email: stringOrNull(body.email ?? body.referrerEmail ?? body.referrer_email),
  };

  if (!identifier.leadId && !identifier.referralCode && !identifier.email) {
    return NextResponse.json(
      { error: "missing_identifier", detail: "one of leadId, referralCode or email is required" },
      { status: 400 },
    );
  }

  const result = await syncReferralRewardsFor(identifier);

  if (result.status === "failed") {
    // 502, not 500: the failure is Mautic's, and the caller should retry.
    console.error("[webhooks/referral-confirmed] Mautic sync failed", { error: result.error });
    return NextResponse.json({ ok: false, ...result }, { status: 502 });
  }
  if (result.status === "skipped") {
    // 200 with a reason, not 404: an unknown referrer is a normal outcome (a
    // contact who never signed up here), and 404 would make the sender retry
    // forever. `contact_not_in_mautic` is likewise benign, not an error.
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  }

  return NextResponse.json({ ok: true, ...result }, { status: 200 });
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}
