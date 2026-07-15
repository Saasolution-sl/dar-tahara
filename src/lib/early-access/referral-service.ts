import "server-only";
import { serviceSelect, serviceInsert, serviceUpdate } from "@/lib/supabase-rpc";
import { canCreditReferral } from "./referral";

type LeadRow = { id: string; referral_code: string | null; referred_by_code: string | null; verified_referral_count: number | null };

/**
 * Credit a verified referral to the referrer, once. Called when a REFERRED lead
 * verifies their email (a referral only counts after verification — brief §29).
 * Guards against self-referral and loops, and is idempotent via the unique index
 * on referral_events(referrer, referred, event_type).
 */
export async function creditReferralIfEligible(args: {
  referredLeadId: string;
  referredSignupCode: string;
}): Promise<{ credited: boolean; reason?: string }> {
  // Find the referrer by their referral_code == the code the referred lead used.
  const referrers = await serviceSelect<LeadRow[]>(
    `marketing_leads?referral_code=eq.${encodeURIComponent(args.referredSignupCode)}&select=id,referral_code,referred_by_code,verified_referral_count&limit=1`,
  );
  const referrer = referrers[0];
  if (!referrer) return { credited: false, reason: "referrer_not_found" };

  const check = canCreditReferral({
    referrerLeadId: referrer.id,
    referredLeadId: args.referredLeadId,
    referrerCode: referrer.referral_code ?? "",
    referredSignupCode: args.referredSignupCode,
    referrerReferredBy: referrer.referred_by_code,
  });
  if (!check.ok) return { credited: false, reason: check.reason };

  // Record the event. The unique partial index makes a duplicate a no-op insert
  // (ignore-duplicates), so double verification can't double-count.
  try {
    await serviceInsert("referral_events", {
      referrer_lead_id: referrer.id,
      referred_lead_id: args.referredLeadId,
      referral_code: args.referredSignupCode,
      event_type: "verified",
      status: "counted",
    });
  } catch (e) {
    // A duplicate (already counted) surfaces as a 409-style conflict — treat as
    // success-without-increment rather than an error.
    if (String(e).includes("409") || String(e).toLowerCase().includes("duplicate")) {
      return { credited: false, reason: "already_counted" };
    }
    throw e;
  }

  // Recompute the count from the source of truth (counted verified events) so it
  // can never drift, and mirror it onto the referrer lead + link back to referrer.
  const events = await serviceSelect<Array<{ id: string }>>(
    `referral_events?referrer_lead_id=eq.${referrer.id}&event_type=eq.verified&status=eq.counted&select=id`,
  );
  const count = events.length;
  await serviceUpdate("marketing_leads", `id=eq.${referrer.id}`, { verified_referral_count: count });
  await serviceUpdate("marketing_leads", `id=eq.${args.referredLeadId}`, {
    referred_by_lead_id: referrer.id,
  }).catch(() => {});

  return { credited: true };
}
