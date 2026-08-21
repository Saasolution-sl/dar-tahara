import "server-only";

import { createHash } from "node:crypto";

export type FileInspection = {
  detectedMime: string;
  sha256: string;
  status: "clean" | "clean_signature_only";
  engine: string;
  signature: string;
  scannedAt: string;
};

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function isPlainText(bytes: Uint8Array) {
  if (bytes.includes(0)) return false;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return false;
  }
  const controls = bytes.filter((value) => value < 9 || (value > 13 && value < 32)).length;
  return controls / Math.max(1, bytes.length) < 0.01;
}

export function detectAttachmentMime(bytes: Uint8Array): string | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  if (startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4)) return "video/mp4";
  if (isPlainText(bytes)) return "text/plain";
  return null;
}

function scannerUrl(production: boolean) {
  const value = process.env.MALWARE_SCANNER_URL;
  if (!value) {
    if (production) throw new Error("malware_scanner_not_configured");
    return null;
  }
  const url = new URL(value);
  if (production && url.protocol !== "https:") throw new Error("malware_scanner_insecure_url");
  if (!production && !["http:", "https:"].includes(url.protocol)) throw new Error("malware_scanner_invalid_url");
  return url;
}

export async function inspectAttachmentBytes(
  bytes: Uint8Array,
  claimedMime: string,
  options: { production?: boolean; fetchImpl?: typeof fetch; now?: Date } = {},
): Promise<FileInspection> {
  const detectedMime = detectAttachmentMime(bytes);
  if (!detectedMime || detectedMime !== claimedMime) throw new Error("attachment_content_type_mismatch");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const production = options.production ?? process.env.NODE_ENV === "production";
  const url = scannerUrl(production);
  const scannedAt = (options.now || new Date()).toISOString();
  if (!url) {
    return { detectedMime, sha256, status: "clean_signature_only", engine: "signature-only", signature: "not-scanned", scannedAt };
  }

  const response = await (options.fetchImpl || fetch)(url, {
    method: "POST",
    headers: {
      "Content-Type": claimedMime,
      "X-Content-SHA256": sha256,
      ...(process.env.MALWARE_SCANNER_TOKEN ? { Authorization: `Bearer ${process.env.MALWARE_SCANNER_TOKEN}` } : {}),
    },
    body: Buffer.from(bytes),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error("malware_scanner_unavailable");
  const result = await response.json().catch(() => null) as { clean?: unknown; engine?: unknown; signature?: unknown } | null;
  if (!result || result.clean !== true) throw new Error(result?.clean === false ? "malware_detected" : "malware_scanner_invalid_response");
  return {
    detectedMime,
    sha256,
    status: "clean",
    engine: typeof result.engine === "string" ? result.engine.slice(0, 100) : "external",
    signature: typeof result.signature === "string" ? result.signature.slice(0, 200) : "clean",
    scannedAt,
  };
}
