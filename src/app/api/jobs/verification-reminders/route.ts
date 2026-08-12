import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { secureTokenEqual } from "@/lib/whatsapp/security";
import { sendPendingVerificationReminders } from "@/lib/early-access/verification-reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Send "don't forget to verify" reminders to leads who completed the
 * early-access form but never confirmed their address.
 *
 * THIS ROUTE SENDS REAL EMAIL. Pass `?dryRun=1` first: it runs the identical
 * selection and reports how many would be mailed without sending anything.
 *
 * Safe to run repeatedly — a lead who has already been given a fresh link is
 * skipped permanently (see isReminderEligible), so there is no way to nag the
 * same person twice.
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

  const params = new URL(req.url).searchParams;
  const dryRun = params.get("dryRun") === "1" || params.get("dryRun") === "true";
  const limit = Number(params.get("limit")) || undefined;

  const result = await sendPendingVerificationReminders({ dryRun, limit }).catch((e) => ({
    scanned: 0,
    sent: 0,
    skipped: 0,
    failures: 1,
    error: e instanceof Error ? e.message : String(e),
  }));

  return NextResponse.json(
    { ok: result.failures === 0, dryRun, ...result },
    { status: result.failures > 0 ? 207 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
