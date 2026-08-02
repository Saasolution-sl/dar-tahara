import { NextRequest, NextResponse } from "next/server";
import { supportWebhookAuthorized } from "@/lib/hospitality-support/security";
import { processHospitalityWebhook } from "@/lib/hospitality-support/sync";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const length = Number(req.headers.get("content-length") || 0);
  if (length > 1_048_576) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  const rawBody = await req.text();
  if (Buffer.byteLength(rawBody) > 1_048_576) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  if (!supportWebhookAuthorized(req.headers, rawBody)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }
  try {
    const payload = JSON.parse(rawBody || "{}");
    const result = await processHospitalityWebhook(payload, rawBody, req.headers.get("x-freescout-event"));
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    return NextResponse.json({ error: "temporary_sync_failure" }, { status: 503 });
  }
}
