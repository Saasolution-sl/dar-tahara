import "server-only";

/**
 * Privacy-safe request metadata. We never store a raw IP against a lead — only a
 * salted hash, which is enough to spot abuse patterns (many signups from one
 * source) without retaining personal data. The salt comes from RATE_LIMIT_SECRET
 * so hashes are not reversible via a rainbow table of IPs.
 */
export async function hashIp(ip: string): Promise<string | null> {
  if (!ip || ip === "unknown") return null;
  const salt = process.env.RATE_LIMIT_SECRET || process.env.EMAIL_VERIFICATION_SIGNING_SECRET || "dar-tahara";
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
