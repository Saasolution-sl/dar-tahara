/**
 * Referral codes and abuse guards.
 *
 * A referral code is a short, non-sequential, human-shareable token. It is
 * generated only AFTER email verification (brief §29) and stored on the lead.
 */

// No 0/O/1/I to avoid ambiguity when a code is read aloud or typed from a flyer.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generate an 8-character code from cryptographically-strong randomness. Takes an
 * injectable RNG so tests are deterministic; defaults to Web Crypto.
 */
export function generateReferralCode(
  randomBytes: (n: number) => Uint8Array = defaultRandomBytes,
): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

function defaultRandomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  // globalThis.crypto is available in Node 18+ and the Edge/browser runtimes.
  globalThis.crypto.getRandomValues(b);
  return b;
}

export function isValidReferralCodeFormat(code: string): boolean {
  return /^[A-HJ-NP-Z2-9]{8}$/.test(code);
}

/**
 * Decide whether a referral may be credited. Rejects self-referral and the
 * degenerate loop where two leads referred each other. `referrerReferredBy` is
 * the code the referrer themselves signed up with.
 */
export function canCreditReferral(args: {
  referrerLeadId: string;
  referredLeadId: string;
  referrerCode: string;
  referredSignupCode: string;
  referrerReferredBy?: string | null;
}): { ok: boolean; reason?: string } {
  if (args.referrerLeadId === args.referredLeadId) return { ok: false, reason: "self_referral" };
  if (args.referredSignupCode !== args.referrerCode) return { ok: false, reason: "code_mismatch" };
  // Direct loop: the "referred" person is actually who referred the referrer.
  if (args.referrerReferredBy && args.referrerReferredBy === args.referredSignupCode)
    return { ok: false, reason: "referral_loop" };
  return { ok: true };
}
