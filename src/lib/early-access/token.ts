/**
 * Email-verification tokens.
 *
 * The raw token goes only into the verification link we email. Supabase stores
 * ONLY its SHA-256 hash, so a database read cannot be used to verify anyone's
 * address, and the token can't be reversed. Tokens are single-use and expiring.
 *
 * The hashing is pure (Web Crypto, available in Node 18+ and Edge), so it is
 * unit-tested; only the route that reads env/DB is server-only.
 */

const TOKEN_TTL_MS = 1000 * 60 * 60 * 48; // 48 hours

/** URL-safe base64 of random bytes (no padding), ~43 chars for 32 bytes. */
export function generateVerificationToken(
  randomBytes: (n: number) => Uint8Array = (n) => {
    const b = new Uint8Array(n);
    globalThis.crypto.getRandomValues(b);
    return b;
  },
): string {
  const bytes = randomBytes(32);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** SHA-256 hex of the token — this is what is stored and compared. */
export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function tokenExpiry(now: number = Date.now()): string {
  return new Date(now + TOKEN_TTL_MS).toISOString();
}

export function isExpired(expiresAt: string, now: number = Date.now()): boolean {
  const t = Date.parse(expiresAt);
  return Number.isNaN(t) || t < now;
}
