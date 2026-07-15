import { NextRequest, NextResponse } from "next/server";
import { hashToken, isExpired } from "@/lib/early-access/token";
import { generateReferralCode, isValidReferralCodeFormat } from "@/lib/early-access/referral";
import { verifyLeadAfterConfirm } from "@/lib/early-access/verify-service";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export const runtime = "nodejs";

/**
 * Email-verification link target (GET, from the email button). Validates the
 * token, marks the lead verified, generates its referral code, credits any
 * referrer, re-syncs Mautic and redirects to the localised success page. Errors
 * redirect to the success page with a status flag rather than leaking detail —
 * and we never reveal whether an unrelated account exists.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const localeParam = req.nextUrl.searchParams.get("locale") ?? "";
  const fallbackLocale: Locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const fail = (status: string, locale: Locale = fallbackLocale) =>
    NextResponse.redirect(`${origin}/${locale}/early-access/success?status=${status}`);

  if (!token) return fail("invalid");

  try {
    const tokenHash = await hashToken(token);
    const result = await verifyLeadAfterConfirm(tokenHash, {
      now: Date.now(),
      isExpired,
      makeReferralCode: () => {
        let code = generateReferralCode();
        // Defensive: regenerate on the astronomically unlikely bad format.
        if (!isValidReferralCodeFormat(code)) code = generateReferralCode();
        return code;
      },
      baseUrl: origin,
    });

    if (result.outcome === "not_found") return fail("invalid");
    if (result.outcome === "expired") return fail("expired");

    const locale: Locale = result.locale && isLocale(result.locale) ? result.locale : fallbackLocale;
    // "already" and "verified" both land on success; the page copy adapts.
    const status = result.outcome === "already_verified" ? "already" : "verified";
    const ref = result.referralCode ? `&ref=${encodeURIComponent(result.referralCode)}` : "";
    return NextResponse.redirect(`${origin}/${locale}/early-access/success?status=${status}${ref}`);
  } catch {
    console.error("[early-access/verify] failed");
    return fail("invalid");
  }
}
