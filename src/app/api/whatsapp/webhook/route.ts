import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { answerAssistant } from "@/lib/assistant/service";
import { detectWhatsAppLocale, sendWhatsAppText, verifyWhatsAppSignature } from "@/lib/whatsapp";
import { isServiceRoleConfigured, serviceSelect, serviceUpsert } from "@/lib/supabase-rpc";

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
type Status = { id?: string; status?: string; recipient_id?: string; timestamp?: string };
type Change = {
  value?: {
    messages?: Message[];
    statuses?: Status[];
    metadata?: { phone_number_id?: string; display_phone_number?: string };
    contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
  };
};

function eq(value: string) {
  return encodeURIComponent(value);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWhatsAppSignature(raw, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }
  const payload = JSON.parse(raw) as { entry?: Array<{ id?: string; changes?: Change[] }> };
  const changes = payload.entry?.flatMap((entry) => entry.changes || []) || [];
  const messages = changes.flatMap((c) => c.value?.messages || []);
  const statuses = changes.flatMap((c) => c.value?.statuses || []);

  if (isServiceRoleConfigured()) {
    for (const status of statuses) {
      if (!status.id) continue;
      await serviceUpsert("whatsapp_events", {
        provider_event_id: status.id,
        event_type: `status.${status.status || "unknown"}`,
        phone_number: status.recipient_id || null,
        payload,
        processed_at: new Date().toISOString(),
      }, "provider_event_id").catch(() => undefined);
    }
  }

  for (const message of messages) {
    const phone = message.from;
    const text = message.type === "text" ? message.text?.body?.trim() : "";
    if (!phone || !text) continue;
    let customer: { id: string; full_name?: string | null; preferred_language: string } | undefined;
    let conversationId: string | null = null;
    if (isServiceRoleConfigured()) {
      const variants = [phone, `+${phone}`];
      const rows = await serviceSelect<{ id: string; full_name?: string; preferred_language: string }[]>(`customers?phone=in.(${variants.map(encodeURIComponent).join(",")})&select=id,full_name,preferred_language&limit=1`).catch(() => []);
      customer = rows[0];
      const conversations = await serviceSelect<Array<{ id: string }>>(
        `assistant_conversations?channel=eq.whatsapp&contact_handle=eq.${eq(phone)}&status=neq.closed&select=id&order=last_message_at.desc&limit=1`,
      ).catch(() => []);
      conversationId = conversations[0]?.id || null;
      if (message.id) {
        await serviceUpsert("whatsapp_events", {
          provider_event_id: message.id,
          event_type: `message.${message.type || "unknown"}`,
          phone_number: phone,
          payload: message,
          processed_at: new Date().toISOString(),
        }, "provider_event_id").catch(() => undefined);
      }
    }
    const locale = customer?.preferred_language && isLocale(customer.preferred_language)
      ? customer.preferred_language
      : detectWhatsAppLocale(text);
    const reply = await answerAssistant({
      channel: "whatsapp",
      message: text,
      locale,
      conversationId,
      customerId: customer?.id || null,
      customerName: customer?.full_name || null,
      contact: phone,
    });
    const sent = await sendWhatsAppText(phone, reply.answer);
    if (isServiceRoleConfigured()) {
      if (sent.id) {
        await serviceUpsert("whatsapp_events", {
          provider_event_id: sent.id,
          event_type: "message.sent",
          phone_number: phone,
          payload: { assistant_conversation_id: reply.conversationId, intent: reply.intent },
          processed_at: new Date().toISOString(),
        }, "provider_event_id").catch(() => undefined);
      }
    }
  }
  return NextResponse.json({ received: true });
}
