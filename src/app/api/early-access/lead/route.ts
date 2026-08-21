import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { featureEnabled } from "@/lib/feature-flags";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { rateLimitShared } from "@/lib/rate-limit";
import { isServiceRoleConfigured } from "@/lib/supabase-rpc";
import { verifyTurnstile } from "@/lib/turnstile";
import { parseAttribution, type Attribution } from "@/lib/early-access/attribution";
import { screenSubmission } from "@/lib/early-access/antispam";
import { sendVerificationEmail } from "@/lib/early-access/email";
import { isOpaqueToken, isSessionId, type SessionCredentials } from "@/lib/early-access/funnel";
import { registerEarlyAccessSession, updateSessionMauticContactFromLead, updateSignupSession } from "@/lib/early-access/funnel-server";
import { persistEarlyAccessLead } from "@/lib/early-access/lead-persistence";
import { validateEarlyAccessLead, type EarlyAccessLeadPayload } from "@/lib/early-access/lead-schema";
import { hashIp } from "@/lib/early-access/request-meta";
import { syncLeadAfterSubmit } from "@/lib/early-access/sync-bridge";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!await featureEnabled("early_access_enabled")) {
    return NextResponse.json({ ok: false, error: "feature_disabled" }, { status: 403 });
  }
  const ip = clientIpFromHeaders(req.headers);
  const limit = await rateLimitShared(`early-access-lead:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
    });
  }

  const body = await req.json().catch(() => null) as EarlyAccessLeadPayload | null;
  if (!body) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });

  const spam = screenSubmission({ honeypot: body.companyWebsite, elapsedMs: body.elapsedMs });
  if (spam.spam) return NextResponse.json({ ok: true, verificationSent: false });

  const validation = validateEarlyAccessLead(body);
  if (!validation.ok || !validation.normalized) {
    await recordFailure(body, "validation_failed", 400, "server_validation");
    return NextResponse.json({ ok: false, error: "validation_failed", fields: validation.errors }, { status: 400 });
  }

  const captcha = await verifyTurnstile(body.turnstileToken, ip);
  if (!captcha.success) {
    await recordFailure(body, "captcha_failed", 400, "captcha");
    return NextResponse.json({ ok: false, error: "captcha_failed" }, { status: 400 });
  }
  if (!isServiceRoleConfigured()) {
    console.error("[early-access/lead] service role not configured");
    await recordFailure(body, "server_error", 500, "configuration");
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const locale: Locale = body.locale && isLocale(body.locale) ? body.locale : defaultLocale;
  const last: Attribution = {
    sourceCode: body.src,
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign,
    utmContent: body.utmContent,
    utmTerm: body.utmTerm,
  };
  const first = parseFirstTouch(body.firstTouch) ?? last;

  let persisted: Awaited<ReturnType<typeof persistEarlyAccessLead>>;
  try {
    persisted = await persistEarlyAccessLead(body, validation.normalized, {
      attribution: { first, last },
      locale,
      requestMetadata: {
        ip_hash: await hashIp(ip),
        ua: (req.headers.get("user-agent") ?? "").slice(0, 200),
        locale,
        source_page: "/early-access",
      },
    });
  } catch (error) {
    console.error("[early-access/lead] persist failed", redact(String(error), body.email));
    await recordFailure(body, "server_error", 500, "persistence");
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const credentials = sessionCredentials(body);
  await registerEarlyAccessSession(
    credentials,
    persisted.leadId,
    validation.normalized.city,
    persisted.onboardingPayload,
  ).catch(() => {});

  let verificationSent = false;
  if (persisted.verificationToken) {
    try {
      const result = await sendVerificationEmail({
        email: validation.normalized.email,
        token: persisted.verificationToken,
        locale,
        baseUrl: new URL(req.url).origin,
      });
      verificationSent = result.sent;
    } catch {
      console.error("[early-access/lead] verification email failed");
    }
  }

  // The lead is already safe in Supabase. Mautic is an idempotent, recoverable
  // follow-up: transient failure leaves mautic_sync_status retryable.
  try {
    await syncLeadAfterSubmit(persisted.leadId, persisted.onboardingPayload, {
      emailVerified: persisted.alreadyVerified,
    });
    await updateSessionMauticContactFromLead(persisted.leadId);
  } catch {
    console.error("[early-access/lead] Mautic sync failed; lead queued for retry");
  }

  return NextResponse.json({ ok: true, verificationSent });
}

function sessionCredentials(body: EarlyAccessLeadPayload): SessionCredentials | undefined {
  return isSessionId(body.signupSessionId) && isOpaqueToken(body.signupSessionToken)
    ? { id: body.signupSessionId, token: body.signupSessionToken }
    : undefined;
}

async function recordFailure(
  body: EarlyAccessLeadPayload,
  errorCode: string,
  httpStatus: number,
  errorType: string,
) {
  const credentials = sessionCredentials(body);
  if (!credentials) return;
  await updateSignupSession({
    credentials,
    event: {
      eventName: "early_access_error",
      stepId: "contact",
      stepIndex: 0,
      errorType,
      errorCode,
      metadata: { http_status: httpStatus },
    },
  }).catch(() => {});
}

function parseFirstTouch(input: unknown): Attribution | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const raw = input as Record<string, unknown>;
  const params = new URLSearchParams();
  const mappings = [
    ["sourceCode", "src"], ["utmSource", "utm_source"], ["utmMedium", "utm_medium"],
    ["utmCampaign", "utm_campaign"], ["utmContent", "utm_content"], ["utmTerm", "utm_term"],
  ] as const;
  for (const [source, target] of mappings) {
    if (typeof raw[source] === "string") params.set(target, raw[source]);
  }
  return parseAttribution(params);
}

function redact(message: string, email: string): string {
  return message.replaceAll(email, "<redacted>").slice(0, 200);
}
