import { isIP } from "node:net";

/**
 * Mailing-list domain logic, pure, framework-agnostic helpers shared by the
 * API route, the tests and (where relevant) the client. No secrets here.
 */

export const SIGNUP_SOURCES = ["homepage_popup", "homepage_footer", "launch_page"] as const;
export type SignupSource = (typeof SIGNUP_SOURCES)[number];

export function isSignupSource(value: unknown): value is SignupSource {
  return typeof value === "string" && (SIGNUP_SOURCES as readonly string[]).includes(value);
}

/**
 * Pragmatic email check (front + back use the same rule). Deliberately strict
 * enough to catch typos, loose enough not to reject valid addresses.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trim surrounding whitespace and lowercase, the canonical stored form. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  const email = normalizeEmail(raw);
  return email.length <= 254 && EMAIL_RE.test(email);
}

export type SubscribeInput = {
  email: string;
  preferredLanguage?: string | null;
  countryCode?: string | null;
  signupSource: SignupSource;
  consent: boolean;
  firstName?: string | null;
  city?: string | null;
};

export type SubscribeValidation =
  | { ok: true; value: SubscribeInput }
  | { ok: false; error: "invalid_email" | "consent_required" | "bad_request" };

/** Validate + normalise a raw submission payload (used by the API route). */
export function validateSubscribe(body: unknown): SubscribeValidation {
  if (typeof body !== "object" || body === null) return { ok: false, error: "bad_request" };
  const b = body as Record<string, unknown>;

  if (typeof b.email !== "string" || !isValidEmail(b.email)) {
    return { ok: false, error: "invalid_email" };
  }
  // Consent must be explicitly true (no pre-checked marketing boxes).
  if (b.consent !== true) return { ok: false, error: "consent_required" };

  const source = isSignupSource(b.source) ? b.source : "homepage_popup";
  const clean = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

  return {
    ok: true,
    value: {
      email: normalizeEmail(b.email),
      preferredLanguage: clean(b.language, 8),
      countryCode: typeof b.country === "string" && b.country.trim() ? b.country.trim().toUpperCase().slice(0, 2) : null,
      signupSource: source,
      consent: true,
      firstName: clean(b.firstName, 120),
      city: clean(b.city, 120),
    },
  };
}

/**
 * Minimal in-memory fixed-window rate limiter. Per serverless instance only,
 * a good first defence; pair with Turnstile and, for scale, an edge KV store.
 */
const RATE_LIMIT = { windowMs: 60_000, max: 5 };
const hits = new Map<string, { count: number; resetAt: number }>();

export type RateLimitPolicy = { windowMs: number; max: number };

export function rateLimit(
  key: string,
  now = Date.now(),
  policy: RateLimitPolicy = RATE_LIMIT,
): { allowed: boolean; retryAfterMs: number } {
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + policy.windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (entry.count >= policy.max) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }
  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

function validIp(value: string | undefined): string | null {
  if (!value) return null;
  const candidate = value.trim();
  return isIP(candidate) ? candidate.toLowerCase() : null;
}

/**
 * Client IP supplied by the trusted reverse proxy.
 *
 * Caddy appends the peer address to X-Forwarded-For. Selecting from the right
 * prevents a caller-controlled left-most value from bypassing rate limits.
 * Set TRUSTED_PROXY_HOPS only when the production proxy chain is deliberately
 * changed and verified.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const hops = Math.max(1, Number.parseInt(process.env.TRUSTED_PROXY_HOPS || "1", 10) || 1);
  const chain = (headers.get("x-forwarded-for") || "")
    .split(",")
    .map((value) => validIp(value))
    .filter((value): value is string => Boolean(value));
  return chain.at(-hops) || "unknown";
}
