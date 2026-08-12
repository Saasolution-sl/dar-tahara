import "server-only";
import { mauticFromEnv } from "@/lib/mautic/env";
import { serviceSelect } from "@/lib/supabase-rpc";
import { site } from "@/lib/site";
import { normalizeEmail } from "./schema";
import {
  buildReferralLink,
  computeReferralRewards,
  mapRewardsToMauticFields,
} from "./referral-rewards";
import type { MauticClient } from "@/lib/mautic/client";

type ReferrerRow = {
  id: string;
  email: string;
  normalized_email: string | null;
  preferred_language: string | null;
  referral_code: string | null;
  verified_referral_count: number | null;
  mautic_contact_id: number | null;
};

export type ReferralRewardSyncResult =
  | { status: "synchronized"; contactId: number }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

/**
 * Push a referrer's reward state onto their Mautic contact after a referral is
 * confirmed, so the reward emails have live numbers to print.
 *
 * Best-effort by design, exactly like syncLeadAfterSubmit: the referral itself is
 * already durably counted in `referral_events` before this runs, so a Mautic
 * outage must never fail the referral. Failures are returned (and logged by the
 * caller) rather than thrown — the weekly campaign pass re-sends with whatever
 * Mautic holds, and the next confirmed referral re-pushes the full field set.
 *
 * Takes an injectable client so the whole path is testable without a network.
 */
export async function syncReferralRewards(
  referrerLeadId: string,
  injectedClient?: MauticClient | null,
): Promise<ReferralRewardSyncResult> {
  const client = injectedClient ?? mauticFromEnv();
  if (!client) return { status: "skipped", reason: "mautic_not_configured" };

  const rows = await serviceSelect<ReferrerRow[]>(
    `marketing_leads?id=eq.${referrerLeadId}&select=id,email,normalized_email,preferred_language,referral_code,verified_referral_count,mautic_contact_id&limit=1`,
  ).catch(() => [] as ReferrerRow[]);
  const referrer = rows[0];
  if (!referrer) return { status: "skipped", reason: "referrer_not_found" };

  const rewards = computeReferralRewards(referrer.verified_referral_count ?? 0);
  const referralLink = referrer.referral_code
    ? buildReferralLink({
        baseUrl: site.url,
        referralCode: referrer.referral_code,
        preferredLanguage: referrer.preferred_language,
      })
    : null;
  const fields = mapRewardsToMauticFields({ rewards, referralLink });

  try {
    // Prefer the contact id we already stored; fall back to an email lookup so a
    // referrer whose original sync predates mautic_contact_id still gets updated
    // rather than silently never receiving a reward email.
    if (referrer.mautic_contact_id) {
      await client.editContact(referrer.mautic_contact_id, fields);
      return { status: "synchronized", contactId: referrer.mautic_contact_id };
    }
    const email = referrer.normalized_email || referrer.email;
    if (!email) return { status: "skipped", reason: "no_contact_identifier" };
    const existing = await client.findContactByEmail(email);
    if (!existing) return { status: "skipped", reason: "contact_not_in_mautic" };
    await client.editContact(existing.id, fields);
    return { status: "synchronized", contactId: existing.id };
  } catch (err) {
    return { status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}

/** How an external system can name the referrer whose reward state changed. */
export type ReferrerIdentifier = {
  leadId?: string | null;
  referralCode?: string | null;
  email?: string | null;
};

/**
 * Resolve a referrer to a lead id. Accepts the three identifiers an external
 * referral/e-commerce system plausibly holds, most specific first, so the caller
 * does not have to know our primary keys.
 */
export async function resolveReferrerLeadId(
  identifier: ReferrerIdentifier,
): Promise<string | null> {
  if (identifier.leadId) return identifier.leadId;

  if (identifier.referralCode) {
    const rows = await serviceSelect<Array<{ id: string }>>(
      `marketing_leads?referral_code=eq.${encodeURIComponent(identifier.referralCode)}&select=id&limit=1`,
    ).catch(() => []);
    if (rows[0]) return rows[0].id;
  }

  if (identifier.email) {
    const normalized = normalizeEmail(identifier.email);
    const rows = await serviceSelect<Array<{ id: string }>>(
      `marketing_leads?normalized_email=eq.${encodeURIComponent(normalized)}&select=id&limit=1`,
    ).catch(() => []);
    if (rows[0]) return rows[0].id;
  }

  return null;
}

/**
 * Recompute and push reward state for a referrer named by any identifier.
 * This is the entry point for the referral-confirmed webhook.
 */
export async function syncReferralRewardsFor(
  identifier: ReferrerIdentifier,
  injectedClient?: MauticClient | null,
): Promise<ReferralRewardSyncResult> {
  const leadId = await resolveReferrerLeadId(identifier);
  if (!leadId) return { status: "skipped", reason: "referrer_not_found" };
  return syncReferralRewards(leadId, injectedClient);
}

/**
 * Re-push reward state for every lead in the referral programme.
 *
 * Runs before the weekly campaign pass so the numbers in the emails are current
 * even for referrers whose per-event sync failed while Mautic was unavailable —
 * without it, a single failed push would leave a contact showing a stale
 * discount until their next referral, which may never come.
 *
 * The default limit covers the whole contact base rather than a page of it: a
 * limit below the population silently leaves the oldest contacts unsynced, and
 * an unsynced contact is invisible to the campaign rather than merely stale.
 */
export async function backfillReferralRewards(limit = 2000): Promise<{
  attempted: number;
  synchronized: number;
  failures: number;
}> {
  const client = mauticFromEnv();
  if (!client) return { attempted: 0, synchronized: 0, failures: 0 };

  // Everyone holding a referral code, NOT just those with referrals already.
  // Filtering on a count > 0 looks like a cheap optimization and is actively
  // wrong: contacts at zero are the largest cohort and the ones the "0
  // referrals" email targets. Left unsynced their Mautic count stays NULL,
  // which never matches the campaign's `= 0` branch (SQL: NULL = 0 is NULL,
  // not true), so they silently receive nothing — and their referral_link
  // stays NULL too, leaving that email's only button with an empty href.
  // Codes are minted at email verification, so this is exactly "in the
  // referral programme".
  const bounded = Math.max(1, Math.min(5000, limit));
  const candidates = await serviceSelect<Array<{ id: string }>>(
    `marketing_leads?referral_code=not.is.null&select=id&order=updated_at.desc&limit=${bounded}`,
  ).catch(() => [] as Array<{ id: string }>);

  let synchronized = 0;
  let failures = 0;
  for (const candidate of candidates) {
    const result = await syncReferralRewards(candidate.id, client).catch(() => ({
      status: "failed" as const,
      error: "unexpected",
    }));
    if (result.status === "synchronized") synchronized += 1;
    else if (result.status === "failed") failures += 1;
  }
  return { attempted: candidates.length, synchronized, failures };
}
