/**
 * Lightweight bot heuristics that complement (not replace) Turnstile.
 *
 * These are cheap server-side signals: a filled honeypot field and an
 * implausibly fast submission. They are intentionally forgiving — the goal is to
 * catch trivial bots without ever blocking a fast, legitimate human on a slow
 * connection, so the thresholds are generous and Turnstile does the heavy lifting.
 */

/** Minimum time a genuine multi-step form takes to complete, in ms. */
export const MIN_FORM_ELAPSED_MS = 3_000;

export type SpamVerdict = { spam: boolean; reason?: "honeypot" | "too_fast" };

export function screenSubmission(input: {
  honeypot?: string;
  elapsedMs?: number;
}): SpamVerdict {
  // Honeypot: a hidden field no human sees. Any content = a bot that filled all
  // inputs. This is the strong signal.
  if (input.honeypot && input.honeypot.trim().length > 0) {
    return { spam: true, reason: "honeypot" };
  }
  // Speed: only trust the timer when the client actually reported one. A missing
  // timer is not treated as spam (JS-disabled or older client).
  if (typeof input.elapsedMs === "number" && input.elapsedMs >= 0 && input.elapsedMs < MIN_FORM_ELAPSED_MS) {
    return { spam: true, reason: "too_fast" };
  }
  return { spam: false };
}

// A small, maintained list of throwaway domains. Kept deliberately short: the
// aim is to flag the obvious ones for review, not to police every disposable
// provider (which is a losing game and risks false positives).
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "throwaway.email", "yopmail.com", "trashmail.com",
  "getnada.com", "sharklasers.com", "maildrop.cc", "fakeinbox.com",
]);

export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  return DISPOSABLE_DOMAINS.has(email.slice(at + 1).toLowerCase());
}
