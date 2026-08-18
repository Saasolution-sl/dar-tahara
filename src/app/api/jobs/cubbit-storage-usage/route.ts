import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { secureTokenEqual } from "@/lib/whatsapp/security";
import { serviceInsert } from "@/lib/supabase-rpc";
import { getBucketUsageBytes, isCubbitConfigured } from "@/lib/cubbit/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_CAP_BYTES = 1_000_000_000_000; // 1 TB (decimal), matches how Cubbit markets its plan sizes.
const ALERT_THRESHOLDS = [1, 0.9, 0.8]; // Checked highest-first so only the highest crossed threshold is reported.

function formatBytes(bytes: number): string {
  return `${(bytes / 1_000_000_000_000).toFixed(3)} TB`;
}

async function sendUsageAlert(to: string, usedBytes: number, capBytes: number, thresholdCrossed: number, objectCount: number, truncated: boolean): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAILING_FROM_EMAIL;
  if (!apiKey || !from) return false;
  const percent = Math.round((usedBytes / capBytes) * 100);
  const subject = `Dar Tahara Cubbit storage at ${percent}% of the ${formatBytes(capBytes)} alert cap`;
  const html = `<div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#26241f;">
    <p>The <code>dar-tahara-storage</code> Cubbit bucket has crossed <strong>${Math.round(thresholdCrossed * 100)}%</strong> of its ${formatBytes(capBytes)} alert cap.</p>
    <ul>
      <li>Used: ${formatBytes(usedBytes)} (${usedBytes.toLocaleString()} bytes)</li>
      <li>Objects: ${objectCount.toLocaleString()}${truncated ? " (scan capped, actual total may be higher)" : ""}</li>
    </ul>
    <p>This is an informational alert only — nothing is blocked or deleted automatically.</p>
  </div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function run(req: NextRequest) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
  if (!await isAdminAuthorized() && !secureTokenEqual(bearer, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isCubbitConfigured()) return NextResponse.json({ ok: true, skipped: "cubbit_not_configured" });

  const capBytes = Number(process.env.CUBBIT_STORAGE_ALERT_CAP_BYTES) || DEFAULT_CAP_BYTES;
  const alertEmail = process.env.CUBBIT_STORAGE_ALERT_EMAIL;
  const usage = await getBucketUsageBytes();
  const ratio = usage.totalBytes / capBytes;
  const thresholdCrossed = ALERT_THRESHOLDS.find((t) => ratio >= t);

  let alerted = false;
  if (thresholdCrossed && alertEmail) {
    alerted = await sendUsageAlert(alertEmail, usage.totalBytes, capBytes, thresholdCrossed, usage.objectCount, usage.truncated);
    if (alerted) {
      await serviceInsert("audit_logs", {
        actor_user_id: null,
        action: "cubbit_storage_usage_alert_sent",
        resource_type: "cubbit_bucket",
        resource_id: null,
        new_value: { totalBytes: usage.totalBytes, capBytes, thresholdCrossed, objectCount: usage.objectCount, truncated: usage.truncated },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    totalBytes: usage.totalBytes,
    objectCount: usage.objectCount,
    truncated: usage.truncated,
    capBytes,
    percentUsed: Math.round(ratio * 1000) / 10,
    thresholdCrossed: thresholdCrossed ?? null,
    alertSent: alerted,
  });
}

export const GET = run;
export const POST = run;
