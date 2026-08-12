import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { secureTokenEqual } from "@/lib/whatsapp/security";
import { backfillReferralRewards } from "@/lib/early-access/referral-rewards-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Refresh referral reward fields on every Mautic contact in the programme.
 *
 * Deliberately separate from /api/jobs/early-access even though that job also
 * runs this backfill: that route additionally sends abandonment reminder
 * emails, so it cannot be used to reconcile referral data without also mailing
 * real leads. This route only ever writes contact fields — it sends nothing —
 * which makes it safe to run on demand, including as the one-off that populates
 * contacts whose count is still NULL and therefore matches no campaign branch.
 *
 * Idempotent: every value is derived from verified_referral_count, so running
 * it twice produces the same result.
 */
async function authorized(req: NextRequest): Promise<boolean> {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
  return (
    (await isAdminAuthorized()) ||
    secureTokenEqual(bearer, process.env.EARLY_ACCESS_JOB_SECRET) ||
    secureTokenEqual(bearer, process.env.CRON_SECRET)
  );
}

export async function POST(req: NextRequest) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = Number(new URL(req.url).searchParams.get("limit")) || undefined;
  const result = await backfillReferralRewards(limit).catch((e) => ({
    attempted: 0,
    synchronized: 0,
    failures: 1,
    error: e instanceof Error ? e.message : String(e),
  }));

  return NextResponse.json(
    { ok: result.failures === 0, ...result },
    { status: result.failures > 0 ? 207 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
