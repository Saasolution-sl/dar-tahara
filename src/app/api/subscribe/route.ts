import { NextRequest, NextResponse } from "next/server";
import { validateSubscribe, rateLimit, clientIpFromHeaders } from "@/lib/mailing-list";
import {
  callRpc,
  isSupabaseConfigured,
  isServiceRoleConfigured,
  serviceSelect,
} from "@/lib/supabase-rpc";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendConfirmationEmail, isEmailConfigured } from "@/lib/email";
import { countryFromHeaders } from "@/lib/geo-language";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);

  // Rate limit (per IP, best-effort per instance).
  const rl = rateLimit(`subscribe:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const validated = validateSubscribe(body);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }
  const input = validated.value;

  // Bot protection (skipped automatically when Turnstile isn't configured).
  const captchaToken =
    typeof (body as Record<string, unknown>)?.turnstileToken === "string"
      ? ((body as Record<string, unknown>).turnstileToken as string)
      : undefined;
  const captcha = await verifyTurnstile(captchaToken, ip);
  if (!captcha.success) {
    return NextResponse.json({ ok: false, error: "captcha_failed" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    console.error("[subscribe] supabase not configured");
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  // Country is derived server-side from the IP header (not trusted from client).
  const country = countryFromHeaders(req.headers) ?? input.countryCode ?? null;
  const locale: Locale =
    input.preferredLanguage && isLocale(input.preferredLanguage)
      ? input.preferredLanguage
      : defaultLocale;

  try {
    const result = await callRpc<Array<{ status: string; already_confirmed: boolean }>>(
      "subscribe_to_mailing_list",
      {
        p_email: input.email,
        p_preferred_language: input.preferredLanguage,
        p_country_code: country,
        p_signup_source: input.signupSource,
        p_consent: input.consent,
        p_first_name: input.firstName,
        p_city: input.city,
      },
    );

    const row = result?.[0];
    const doubleOptIn = isServiceRoleConfigured() && isEmailConfigured();

    // Send the confirmation email only when fully configured and pending.
    if (
      row &&
      (row.status === "created" || row.status === "resubscribed") &&
      !row.already_confirmed &&
      doubleOptIn
    ) {
      try {
        const rows = await serviceSelect<Array<{ confirmation_token: string }>>(
          `mailing_list?email=eq.${encodeURIComponent(input.email)}&select=confirmation_token`,
        );
        const token = rows?.[0]?.confirmation_token;
        if (token) {
          await sendConfirmationEmail({
            email: input.email,
            token,
            locale,
            baseUrl: new URL(req.url).origin,
          });
        }
      } catch {
        // Never fail the signup because the email step had a problem.
        console.error("[subscribe] confirmation email step failed");
      }
    }

    // Uniform response regardless of created/exists (prevents email enumeration).
    return NextResponse.json({ ok: true, doubleOptIn });
  } catch (e) {
    const msg = String(e);
    if (msg.includes("invalid_email") || msg.includes("22023")) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    // Log without the email address.
    console.error("[subscribe] rpc failed:", msg.replace(input.email, "<redacted>").slice(0, 160));
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
