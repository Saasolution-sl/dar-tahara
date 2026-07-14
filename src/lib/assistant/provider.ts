import "server-only";
import type { AssistantInput, RetrievedKnowledge } from "./types";

export type ProviderResult = {
  answer: string;
  confidence: number;
} | null;

export function assistantProviderConfigured(): boolean {
  return Boolean(
    process.env.ASSISTANT_PROVIDER &&
    process.env.ASSISTANT_MODEL &&
    process.env.ASSISTANT_API_KEY &&
    process.env.ASSISTANT_API_BASE_URL,
  );
}

/**
 * OpenAI-compatible provider abstraction.
 *
 * The app remains provider-neutral: set ASSISTANT_API_BASE_URL, ASSISTANT_API_KEY
 * and ASSISTANT_MODEL for a compatible chat-completions API. If not configured,
 * the assistant falls back to deterministic grounded composition from approved
 * knowledge and tools.
 */
export async function generateWithConfiguredProvider(
  input: AssistantInput,
  retrieved: RetrievedKnowledge[],
): Promise<ProviderResult> {
  if (!assistantProviderConfigured()) return null;
  const baseUrl = process.env.ASSISTANT_API_BASE_URL as string;
  const apiKey = process.env.ASSISTANT_API_KEY as string;
  const model = process.env.ASSISTANT_MODEL as string;
  const timeoutMs = Number(process.env.ASSISTANT_TIMEOUT_MS || 8000);
  const temperature = Number(process.env.ASSISTANT_TEMPERATURE || 0.2);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const sources = retrieved.map((item) => `- ${item.article.title}: ${item.article.content}`).join("\n");
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: Number(process.env.ASSISTANT_MAX_TOKENS || 450),
        messages: [
          {
            role: "system",
            content:
              "You are the Dar Tahara concierge assistant. Answer warmly and concisely using only the approved knowledge supplied. Do not invent prices, policies, availability, bookings or refunds. If the knowledge is insufficient, offer a Dar Tahara specialist.",
          },
          {
            role: "user",
            content: `Locale: ${input.locale}\nChannel: ${input.channel}\nApproved knowledge:\n${sources}\n\nCustomer message:\n${input.message}`,
          },
        ],
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const answer = data.choices?.[0]?.message?.content?.trim();
    return answer ? { answer, confidence: 0.82 } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
