/**
 * Best-effort phone normalization to E.164, without pulling in a full
 * phone-parsing dependency. It handles the common cases the form produces,
 * a country calling code plus a national number, or a number the user already
 * typed with a leading "+" or "00" prefix, and otherwise returns null so the
 * caller stores the raw value rather than a wrong "normalized" one.
 */

import { parsePhone, type CountryCode } from "@/lib/phone/lib";

/** Strip everything except digits and a single leading plus. */
function clean(raw: string): string {
  const trimmed = raw.trim().replace(/[^\d+]/g, "");
  // Collapse "00" international prefix to "+".
  if (trimmed.startsWith("00")) return "+" + trimmed.slice(2).replace(/\+/g, "");
  // Keep only a leading plus.
  const plus = trimmed.startsWith("+");
  return (plus ? "+" : "") + trimmed.replace(/\+/g, "");
}

/**
 * Combine an optional country calling code (e.g. "+212") with a national number.
 * Returns E.164 like "+212612345678", or null when the input can't be trusted.
 */
export function toE164(
  nationalNumber: string | undefined | null,
  callingCode?: string | null,
): string | null {
  if (!nationalNumber || !nationalNumber.trim()) return null;
  let n = clean(nationalNumber);

  if (n.startsWith("+")) {
    // Already international.
    return isPlausibleE164(n) ? n : null;
  }

  // Drop a single leading national-trunk zero before prefixing the country code.
  n = n.replace(/^0+/, "");
  const cc = callingCode ? clean(callingCode) : "";
  if (cc.startsWith("+")) {
    const combined = cc + n;
    return isPlausibleE164(combined) ? combined : null;
  }
  // No usable calling code and not international → cannot safely normalize.
  return null;
}

/** E.164 allows up to 15 digits after the plus; require at least 8 to be real. */
export function isPlausibleE164(v: string): boolean {
  return /^\+\d{8,15}$/.test(v);
}

/* ── Country-aware validation ───────────────────────────────────────────────
 * The helpers above are format-only and stay as the last-resort fallback. The
 * ones below use libphonenumber metadata to check a number against the rules of
 * the SELECTED country, which is what actually catches a Dutch mobile typed
 * while "Morocco" is chosen. */

/**
 * Parse a national number against an ISO 3166-1 alpha-2 country and return
 * E.164, or null when it is not a valid number for that country.
 */
export function toE164ForCountry(
  nationalNumber: string | undefined | null,
  iso2: string | undefined | null,
): string | null {
  if (!nationalNumber || !nationalNumber.trim()) return null;
  const country = iso2?.toUpperCase();
  if (!country || !/^[A-Z]{2}$/.test(country)) return null;
  try {
    const parsed = parsePhone(nationalNumber, country as CountryCode);
    if (parsed && parsed.isValid()) return parsed.number;
  } catch {
    /* fall through to null, never throw at the caller */
  }
  return null;
}

/** True when the number is valid for that country. */
export function isValidPhoneForCountry(
  nationalNumber: string | undefined | null,
  iso2: string | undefined | null,
): boolean {
  return toE164ForCountry(nationalNumber, iso2) !== null;
}

/**
 * Best available normalization: prefer strict country-aware parsing, then fall
 * back to the permissive calling-code combination so an unusual-but-real number
 * is stored rather than dropped.
 */
export function normalizePhone(
  nationalNumber: string | undefined | null,
  opts: { country?: string | null; callingCode?: string | null },
): string | null {
  return (
    toE164ForCountry(nationalNumber, opts.country) ??
    toE164(nationalNumber, opts.callingCode)
  );
}
