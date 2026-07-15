import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, normalizeEmail } from "@/lib/early-access/schema";
import { rateLimit, clientIpFromHeaders } from "@/lib/mailing-list";
import { serviceSelect, serviceInsert, isServiceRoleConfigured } from "@/lib/supabase-rpc";
import { generateVerificationToken, hashToken, tokenExpiry } from "@/lib/early-access/token";
import { recentTokenCount } from "@/lib/early-access/persistence";
import { sendVerificationEmail } from "@/lib/early-access/email";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export const runtime = "nodejs";

const RESEND_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_RESENDS_PER_WINDOW = 3;

type LeadRow = { id: string; email: string; status: string; preferred_language: string | null };

/**
 * Resend the verification email. Deliberately enumeration-safe: the response is
 * identical whether or not the address exists, is already verified, or is
 * throttled — so this endpoint can't be used to probe who signed up.
 */
export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const rl = rateLimit(`ea-resend:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json({ ok: true }, { status: 200 }); // uniform, no signal
  }

  let email = "";
  let localeRaw = "";
  try {
    const body = (await req.json()) as { email?: string; locale?: string };
    email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    localeRaw = typeof body.locale === "string" ? body.locale : "";
  } catch {
    return NextResponse.json({ ok: true });
  }
  const locale: Locale = isLocale(localeRaw) ? localeRaw : defaultLocale;

  // Always return ok below, regardless of what we find.
  const uniform = NextResponse.json({ ok: true });
  if (!isValidEmail(email) || !isServiceRoleConfigured()) return uniform;

  try {
    const rows = await serviceSelect<LeadRow[]>(
      `marketing_leads?normalized_email=eq.${encodeURIComponent(email)}&select=id,email,status,preferred_language&limit=1`,
    );
    const lead = rows[0];
    // Only pending leads get a resend; verified/absent → silent no-op.
    if (!lead || lead.status !== "pending") return uniform;

    // Throttle resends per lead.
    const recent = await recentTokenCount(lead.id, RESEND_WINDOW_MS);
    if (recent >= MAX_RESENDS_PER_WINDOW) return uniform;

    const token = generateVerificationToken();
    await serviceInsert("email_verification_tokens", {
      lead_id: lead.id,
      token_hash: await hashToken(token),
      expires_at: tokenExpiry(),
    });

    const emailLocale: Locale = lead.preferred_language && isLocale(lead.preferred_language)
      ? lead.preferred_language : locale;
    await sendVerificationEmail({ email: lead.email, token, locale: emailLocale, baseUrl: req.nextUrl.origin });
  } catch {
    console.error("[early-access/resend] failed");
  }
  return uniform;
}
