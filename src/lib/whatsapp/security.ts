import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function equalBytes(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function secureTokenEqual(supplied: string | null, expected: string | undefined): boolean {
  return Boolean(supplied && expected && equalBytes(supplied, expected));
}

export function verifyMetaSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null,
  appSecret = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET,
): boolean {
  if (!appSecret || !signatureHeader?.startsWith("sha256=")) return false;
  const supplied = signatureHeader.slice("sha256=".length);
  if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  return equalBytes(supplied.toLowerCase(), expected);
}

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function hashWhatsAppIdentifier(
  value: string,
  secret = process.env.WHATSAPP_PHONE_HASH_SECRET || process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET,
): string {
  if (!secret) throw new Error("whatsapp_hash_secret_not_configured");
  return createHmac("sha256", secret).update(value, "utf8").digest("hex");
}

function encryptionKey(secret = process.env.WHATSAPP_DATA_ENCRYPTION_KEY): Buffer {
  if (!secret) throw new Error("whatsapp_encryption_key_not_configured");
  return createHash("sha256").update(secret, "utf8").digest();
}

export function encryptSensitive(value: string, secret?: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptSensitive(value: string, secret?: string): string {
  const [version, ivText, tagText, cipherText] = value.split(".");
  if (version !== "v1" || !ivText || !tagText || !cipherText) throw new Error("invalid_encrypted_value");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(secret), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(cipherText, "base64url")), decipher.final()]).toString("utf8");
}

export function redactSensitiveText(value: string, maxLength = 500): string {
  return value
    .slice(0, maxLength)
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[payment-data-redacted]")
    .replace(/\b((?:access|entry|door|lock|keypad|pin|code|رمز|كود)(?:\s+code)?)\s*[:=#-]?\s*\d{3,10}\b/gi, "$1 [code-redacted]")
    .replace(/\b\d{6,10}\b/g, "[code-redacted]")
    .replace(/\b(?:cvv|cvc|password|mot de passe|كلمة السر)\s*[:=]?\s*\S+/gi, "$1 [redacted]");
}

export function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "unknown_error";
  return redactSensitiveText(message.replace(/https?:\/\/\S+/g, "[url-redacted]"), 300);
}
