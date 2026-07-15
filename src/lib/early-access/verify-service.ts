import "server-only";
import { serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { sendWelcomeEmail } from "./email";
import { creditReferralIfEligible } from "./referral-service";
import { syncVerifiedLead } from "./sync-bridge-verify";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

type TokenRow = { id: string; lead_id: string; expires_at: string; used_at: string | null };
type LeadRow = {
  id: string; email: string; normalized_email: string; status: string;
  preferred_language: string | null; referral_code: string | null; referred_by_code: string | null;
};

export type VerifyOutcome = "verified" | "already_verified" | "expired" | "not_found";

/**
 * The transactional heart of email verification. Given a token hash:
 *  1. look up an unused, unexpired token,
 *  2. mark it used (single-use) and the lead verified,
 *  3. generate the lead's referral code (once),
 *  4. credit the referrer if this lead was referred and is now verified,
 *  5. re-sync Mautic (email_verified = yes, verified tags/segment) and send the
 *     welcome email.
 *
 * Steps 4–5 are best-effort; a failure there does not un-verify the lead.
 */
export async function verifyLeadAfterConfirm(
  tokenHash: string,
  deps: {
    now: number;
    isExpired: (expiresAt: string, now?: number) => boolean;
    makeReferralCode: () => string;
    baseUrl: string;
  },
): Promise<{ outcome: VerifyOutcome; locale?: string; referralCode?: string | null }> {
  const tokenRows = await serviceSelect<TokenRow[]>(
    `email_verification_tokens?token_hash=eq.${encodeURIComponent(tokenHash)}&select=id,lead_id,expires_at,used_at&limit=1`,
  );
  const tokenRow = tokenRows[0];
  if (!tokenRow) return { outcome: "not_found" };

  const leadRows = await serviceSelect<LeadRow[]>(
    `marketing_leads?id=eq.${tokenRow.lead_id}&select=id,email,normalized_email,status,preferred_language,referral_code,referred_by_code&limit=1`,
  );
  const lead = leadRows[0];
  if (!lead) return { outcome: "not_found" };

  const locale: Locale = lead.preferred_language && isLocale(lead.preferred_language)
    ? lead.preferred_language : defaultLocale;

  // Already verified (idempotent link re-click): return its existing code.
  if (tokenRow.used_at || lead.status !== "pending") {
    return { outcome: "already_verified", locale, referralCode: lead.referral_code };
  }

  if (deps.isExpired(tokenRow.expires_at, deps.now)) {
    return { outcome: "expired", locale };
  }

  // Single-use: mark the token used first so a double-submit can't double-run.
  await serviceUpdate("email_verification_tokens", `id=eq.${tokenRow.id}&used_at=is.null`, {
    used_at: new Date(deps.now).toISOString(),
  });

  // Assign a referral code once; keep an existing one if somehow present.
  const referralCode = lead.referral_code ?? deps.makeReferralCode();

  await serviceUpdate("marketing_leads", `id=eq.${lead.id}`, {
    status: "verified",
    email_verified_at: new Date(deps.now).toISOString(),
    referral_code: referralCode,
  });

  // Fetch the property city for the welcome email (best-effort).
  const cityRows = await serviceSelect<Array<{ city: string | null }>>(
    `cleaning_properties?lead_id=eq.${lead.id}&select=city&limit=1`,
  ).catch(() => [] as Array<{ city: string | null }>);
  const city = cityRows[0]?.city ?? null;

  // Best-effort side effects.
  if (lead.referred_by_code) {
    await creditReferralIfEligible({
      referredLeadId: lead.id,
      referredSignupCode: lead.referred_by_code,
    }).catch(() => {});
  }
  await syncVerifiedLead(lead.id).catch(() => {});
  await sendWelcomeEmail({ email: lead.email, locale, baseUrl: deps.baseUrl, city, referralCode }).catch(() => {});

  return { outcome: "verified", locale, referralCode };
}
