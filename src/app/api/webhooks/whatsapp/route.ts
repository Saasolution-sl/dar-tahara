import { after, NextRequest, NextResponse } from "next/server";
import { isServiceRoleConfigured } from "@/lib/supabase-rpc";
import { drainWhatsAppQueue, enqueueMetaWebhookEvents } from "@/lib/whatsapp/orchestrator";
import { parseMetaWebhook } from "@/lib/whatsapp/payload";
import { safeError, secureTokenEqual, verifyMetaSignature } from "@/lib/whatsapp/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const verified = params.get("hub.mode") === "subscribe" &&
    secureTokenEqual(params.get("hub.verify_token"), process.env.WHATSAPP_VERIFY_TOKEN);
  const challenge = params.get("hub.challenge");
  if (!verified || challenge === null) {
    return NextResponse.json({ error: "verification_failed" }, { status: 403 });
  }
  return new NextResponse(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const declaredLength = Number(req.headers.get("content-length") || 0);
  if (declaredLength > 1_000_000) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  const rawBody = await req.text();
  if (Buffer.byteLength(rawBody, "utf8") > 1_000_000) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }
  if (!verifyMetaSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const events = parseMetaWebhook(payload);
  if (events.length > 100) return NextResponse.json({ error: "too_many_events" }, { status: 413 });
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "persistence_unavailable" }, { status: 503 });
  }
  try {
    const inserted = await enqueueMetaWebhookEvents(events);
    after(async () => {
      await drainWhatsAppQueue(Math.max(1, Math.min(events.length, 20))).catch((error) => {
        console.error(JSON.stringify({ scope: "whatsapp", event: "background_drain_failed", error: safeError(error) }));
      });
    });
    return NextResponse.json({ received: true, queued: inserted }, { status: 200 });
  } catch (error) {
    console.error(JSON.stringify({ scope: "whatsapp", event: "webhook_queue_failed", error: safeError(error) }));
    return NextResponse.json({ error: "temporarily_unavailable" }, { status: 503 });
  }
}
