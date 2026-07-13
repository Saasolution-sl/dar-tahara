import "server-only";

/**
 * Cloudflare Turnstile verification (preferred over image CAPTCHAs).
 * When TURNSTILE_SECRET_KEY is not configured, verification is skipped so the
 * form keeps working in development — enable it by setting the keys.
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  ip?: string,
): Promise<{ success: boolean; skipped: boolean }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: true, skipped: true };
  if (!token) return { success: false, skipped: false };

  try {
    const form = new URLSearchParams();
    form.append("secret", secret);
    form.append("response", token);
    if (ip && ip !== "unknown") form.append("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean };
    return { success: Boolean(data.success), skipped: false };
  } catch {
    // Fail closed on verification errors (do not let bots through on outage
    // when protection is explicitly enabled).
    return { success: false, skipped: false };
  }
}

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}
