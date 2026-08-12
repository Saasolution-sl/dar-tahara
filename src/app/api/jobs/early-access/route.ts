import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { purgeStaleSignupSessionPii, runEarlyAccessAbandonmentJob } from "@/lib/early-access/abandonment";
import { secureTokenEqual } from "@/lib/whatsapp/security";
import { reconcilePendingMauticLeads } from "@/lib/early-access/sync-bridge";
import { backfillReferralRewards } from "@/lib/early-access/referral-rewards-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized(req: NextRequest): Promise<boolean> {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
  return (await isAdminAuthorized())
    || secureTokenEqual(bearer, process.env.EARLY_ACCESS_JOB_SECRET)
    || secureTokenEqual(bearer, process.env.CRON_SECRET);
}

export async function POST(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await runEarlyAccessAbandonmentJob();
  const mautic = await reconcilePendingMauticLeads().catch(() => ({ attempted: 0, failures: 1 }));
  // Refresh referral reward fields before the weekly Mautic campaign pass, so a
  // referrer whose per-event push failed during a Mautic outage still gets
  // current numbers instead of a stale discount frozen until their next referral.
  const referralRewards = await backfillReferralRewards().catch(() => ({
    attempted: 0,
    synchronized: 0,
    failures: 1,
  }));
  let retentionOk = true;
  try {
    await purgeStaleSignupSessionPii();
  } catch {
    retentionOk = false;
  }
  return NextResponse.json({ ok: result.failures === 0 && mautic.failures === 0 && referralRewards.failures === 0 && retentionOk, retentionOk, mautic, referralRewards, ...result }, {
    status: result.failures > 0 || mautic.failures > 0 || referralRewards.failures > 0 || !retentionOk ? 207 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
