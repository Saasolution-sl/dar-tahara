import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SUPPORT_ATTACHMENT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "video/mp4",
]);

const FORBIDDEN_EXTENSIONS = new Set([
  "exe", "com", "bat", "cmd", "msi", "ps1", "sh", "js", "mjs", "cjs",
  "jar", "scr", "dll", "app", "dmg", "pkg", "php", "py", "rb", "vbs",
]);

export const MAX_SUPPORT_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_SUPPORT_ATTACHMENTS = 5;

export function safeAttachmentFilename(value: string): string {
  const base = value.split(/[\\/]/).pop() || "attachment";
  const safe = base.normalize("NFKC").replace(/[^a-zA-Z0-9._ -]/g, "_").replace(/\s+/g, " ").trim();
  return (safe || "attachment").slice(0, 150);
}

export function validateAttachment(file: Pick<File, "name" | "type" | "size">): string | null {
  const safeName = safeAttachmentFilename(file.name);
  const extension = safeName.includes(".") ? safeName.split(".").pop()!.toLowerCase() : "";
  if (!file.size || file.size > MAX_SUPPORT_ATTACHMENT_BYTES) return "attachment_size";
  if (!SUPPORT_ATTACHMENT_MIME_TYPES.has(file.type) || FORBIDDEN_EXTENSIONS.has(extension)) return "attachment_type";
  return null;
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function constantTimeSecretMatch(provided: string | null | undefined, expected: string | null | undefined): boolean {
  if (!provided || !expected) return false;
  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function verifyFreeScoutWebhookSignature(rawBody: string, signature: string | null | undefined, secret: string | null | undefined): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha1", secret).update(rawBody).digest("base64");
  return constantTimeSecretMatch(signature, expected);
}

export function supportWebhookAuthorized(headers: Headers, rawBody: string): boolean {
  const expected = process.env.HOSPITALITY_SUPPORT_WEBHOOK_SECRET;
  const freeScoutSignature = headers.get("x-freescout-signature");
  if (freeScoutSignature) return verifyFreeScoutWebhookSignature(rawBody, freeScoutSignature, expected);
  const bearer = headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
  const headerSecret = headers.get("x-hospitality-support-secret") || headers.get("x-freescout-webhook-secret");
  return constantTimeSecretMatch(headerSecret || bearer, expected);
}

export function safeIntegrationError(error: unknown): string {
  if (!(error instanceof Error)) return "integration_error";
  const code = error.message.split(":", 1)[0].replace(/[^a-zA-Z0-9_-]/g, "_");
  return code.slice(0, 100) || "integration_error";
}
