import { NextRequest, NextResponse } from "next/server";
import { validateAll, type EarlyAccessPayload } from "@/lib/early-access/schema";
import { screenSubmission } from "@/lib/early-access/antispam";
import { parseAttribution, type Attribution } from "@/lib/early-access/attribution";
import { persistSubmission } from "@/lib/early-access/persistence";
import { sendVerificationEmail } from "@/lib/early-access/email";
import { syncLeadAfterSubmit } from "@/lib/early-access/sync-bridge";
import { rateLimit, clientIpFromHeaders } from "@/lib/mailing-list";
import { verifyTurnstile } from "@/lib/turnstile";
import { isServiceRoleConfigured } from "@/lib/supabase-rpc";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { hashIp } from "@/lib/early-access/request-meta";

export const runtime = "nodejs";

/**
 * Early-access submission. Order matters (brief §36): validate → persist to
 * Supabase → RETURN SUCCESS → then best-effort Mautic sync + verification email.
 * A Mautic outage or email hiccup must never lose a valid lead or fail the form.
 */
export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);

  const rl = rateLimit(`early-access:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  let body: EarlyAccessPayload;
  try {
    body = (await req.json()) as EarlyAccessPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Cheap bot screen before doing any real work. Silent success so a bot gets no
  // signal it was caught (mirrors the enumeration-safe response below).
  const spam = screenSubmission({ honeypot: body.companyWebsite, elapsedMs: body.elapsedMs });
  if (spam.spam) {
    return NextResponse.json({ ok: true, verificationSent: false });
  }

  const { ok, errors } = validateAll(body);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "validation_failed", fields: errors }, { status: 400 });
  }

  const captcha = await verifyTurnstile(body.turnstileToken, ip);
  if (!captcha.success) {
    return NextResponse.json({ ok: false, error: "captcha_failed" }, { status: 400 });
  }

  if (!isServiceRoleConfigured()) {
    console.error("[early-access] service role not configured");
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const locale: Locale = body.locale && isLocale(body.locale) ? body.locale : defaultLocale;

  // Attribution: trust the params the client echoes back for last-touch; first-
  // touch is whatever the client preserved from the original visit.
  const lastTouch: Attribution = {
    sourceCode: body.src, utmSource: body.utmSource, utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign, utmContent: body.utmContent, utmTerm: body.utmTerm,
  };
  const firstTouch = parseFirstTouch(body);

  let leadId: string;
  let verificationToken: string;
  try {
    const result = await persistSubmission(body, {
      attribution: { first: firstTouch, last: lastTouch },
      // Privacy-safe metadata only: hashed IP + coarse UA. Never the raw IP.
      requestMetadata: {
        ip_hash: await hashIp(ip),
        ua: (req.headers.get("user-agent") ?? "").slice(0, 200),
        locale,
      },
    });
    leadId = result.leadId;
    verificationToken = result.verificationToken;
  } catch (e) {
    console.error("[early-access] persist failed:", redact(String(e), body.email));
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  // ── From here the lead is SAFE. Everything below is best-effort. ──────────────
  const origin = new URL(req.url).origin;

  // Verification email (operational, not marketing).
  let verificationSent = false;
  try {
    const r = await sendVerificationEmail({ email: body.email, token: verificationToken, locale, baseUrl: origin });
    verificationSent = r.sent;
  } catch {
    console.error("[early-access] verification email step failed");
  }

  // Mautic sync — fail-open: on any error the lead stays queued for the
  // reconation job (its mautic_sync_status was written by persistSubmission).
  try {
    await syncLeadAfterSubmit(leadId, body, { emailVerified: false });
  } catch {
    console.error("[early-access] mautic sync step failed (queued for retry)");
  }

  return NextResponse.json({ ok: true, verificationSent });
}

/** First-touch either arrives echoed under first_* keys or falls back to last. */
function parseFirstTouch(body: EarlyAccessPayload): Attribution | undefined {
  const raw = (body as unknown as Record<string, unknown>).firstTouch;
  if (raw && typeof raw === "object") {
    // Re-parse defensively through the sanitizer.
    const p = new URLSearchParams();
    const f = raw as Record<string, string>;
    if (f.sourceCode) p.set("src", f.sourceCode);
    if (f.utmSource) p.set("utm_source", f.utmSource);
    if (f.utmMedium) p.set("utm_medium", f.utmMedium);
    if (f.utmCampaign) p.set("utm_campaign", f.utmCampaign);
    if (f.utmContent) p.set("utm_content", f.utmContent);
    if (f.utmTerm) p.set("utm_term", f.utmTerm);
    return parseAttribution(p);
  }
  return undefined;
}

function redact(msg: string, email: string): string {
  return msg.replaceAll(email, "<redacted>").slice(0, 200);
}
