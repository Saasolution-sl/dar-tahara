import { NextRequest, NextResponse } from "next/server";
import { answerWhatsAppQuestion, sendWhatsAppText, verifyWhatsAppSignature } from "@/lib/whatsapp";
import { isServiceRoleConfigured, serviceInsert, serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const mode = p.get("hub.mode");
  const token = p.get("hub.verify_token");
  const challenge = p.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return NextResponse.json({ error: "verification_failed" }, { status: 403 });
}

type Message = { from?: string; id?: string; type?: string; text?: { body?: string } };

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWhatsAppSignature(raw, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }
  const payload = JSON.parse(raw) as { entry?: Array<{ changes?: Array<{ value?: { messages?: Message[] } }> }> };
  const messages = payload.entry?.flatMap((e) => e.changes?.flatMap((c) => c.value?.messages || []) || []) || [];
  for (const message of messages) {
    const phone = message.from;
    const text = message.type === "text" ? message.text?.body?.trim() : "";
    if (!phone || !text) continue;
    let customer: { id: string; preferred_language: string } | undefined;
    if (isServiceRoleConfigured()) {
      const variants = [phone, `+${phone}`];
      const rows = await serviceSelect<{ id: string; preferred_language: string }[]>(`customers?phone=in.(${variants.map(encodeURIComponent).join(",")})&select=id,preferred_language&limit=1`).catch(() => []);
      customer = rows[0];
    }
    const reply = answerWhatsAppQuestion(text, customer?.preferred_language);
    const sent = await sendWhatsAppText(phone, reply.answer);
    if (isServiceRoleConfigured()) {
      await serviceInsert("customer_messages", [
        { customer_id: customer?.id || null, channel: "whatsapp", direction: "inbound", recipient: phone, body: text, provider_message_id: message.id || null, status: "received", metadata: { locale: reply.locale, intent: reply.intent } },
        { customer_id: customer?.id || null, channel: "whatsapp", direction: "outbound", recipient: phone, body: reply.answer, provider_message_id: sent.id, status: sent.id ? "sent" : "failed", metadata: { locale: reply.locale, intent: reply.intent } },
      ]).catch(() => undefined);
    }
  }
  return NextResponse.json({ received: true });
}
