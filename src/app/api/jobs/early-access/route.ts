import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { purgeStaleSignupSessionPii, runEarlyAccessAbandonmentJob } from "@/lib/early-access/abandonment";
import { secureTokenEqual } from "@/lib/whatsapp/security";

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
  let retentionOk = true;
  try {
    await purgeStaleSignupSessionPii();
  } catch {
    retentionOk = false;
  }
  return NextResponse.json({ ok: result.failures === 0 && retentionOk, retentionOk, ...result }, {
    status: result.failures > 0 || !retentionOk ? 207 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
