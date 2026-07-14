import "server-only";
import { safeError } from "./security";

export type WhatsAppSendResult = { id: string; attempts: number };

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isMetaConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_VERIFY_TOKEN &&
    (process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET),
  );
}

export async function sendMetaText(
  to: string,
  body: string,
  fetchImpl: typeof fetch = fetch,
): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) throw new Error("whatsapp_not_configured");
  const version = process.env.WHATSAPP_API_VERSION || process.env.WHATSAPP_GRAPH_VERSION || "v25.0";
  let lastError = "whatsapp_send_failed";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetchImpl(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { preview_url: false, body: body.slice(0, 4096) },
        }),
        signal: controller.signal,
        cache: "no-store",
      });
      const data = (await response.json().catch(() => ({}))) as {
        messages?: Array<{ id?: string }>;
        error?: { code?: number; message?: string };
      };
      const id = data.messages?.[0]?.id;
      if (response.ok && id) return { id, attempts: attempt };
      lastError = `whatsapp_http_${response.status}:${safeError(data.error?.message || "unknown")}`;
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastError = `whatsapp_network:${safeError(error)}`;
    } finally {
      clearTimeout(timeout);
    }
    if (attempt < 3) await delay(200 * 2 ** (attempt - 1));
  }
  throw new Error(lastError);
}
