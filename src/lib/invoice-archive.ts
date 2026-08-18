import "server-only";

import { getObjectBytes, isCubbitConfigured, putObject } from "@/lib/cubbit/client";

/**
 * Serves a previously-archived copy of a generated PDF when one exists, or
 * generates it and archives the result for next time. Only call this for
 * documents that are immutable once issued (a draft or still-accumulating
 * document must always be regenerated live, never cached).
 */
export async function getOrArchiveInvoicePdf(key: string, generate: () => Promise<Uint8Array>): Promise<Uint8Array> {
  if (isCubbitConfigured()) {
    const cached = await getObjectBytes(key);
    if (cached) return cached;
  }
  const pdf = await generate();
  if (isCubbitConfigured()) {
    try {
      await putObject(key, Buffer.from(pdf), "application/pdf");
    } catch {
      // Archival is best-effort: the customer still gets their PDF this request.
    }
  }
  return pdf;
}
