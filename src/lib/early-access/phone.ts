/**
 * Best-effort phone normalization to E.164, without pulling in a full
 * phone-parsing dependency. It handles the common cases the form produces —
 * a country calling code plus a national number, or a number the user already
 * typed with a leading "+" or "00" prefix — and otherwise returns null so the
 * caller stores the raw value rather than a wrong "normalized" one.
 */

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
