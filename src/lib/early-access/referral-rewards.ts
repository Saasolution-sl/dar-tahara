/**
 * Referral reward state: the derived values the Mautic reward emails print.
 *
 * Pure and I/O-free so every tier boundary is unit-tested without a network or a
 * database. `verified_referral_count` (recomputed from `referral_events` in
 * referral-service.ts) stays the single source of truth; everything here is a
 * projection of it, denormalized onto the Mautic contact only because Mautic
 * email tokens cannot do arithmetic.
 *
 * Reward model (handoff README): 10 successful referrals x 2.5% each, capped at
 * 25% off a EUR 200 Smart Lock (EUR 150 including installation at maximum).
 */
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/** Referrals needed for the maximum reward. Rewards are capped here. */
export const MAX_REFERRALS = 10;
/** Discount unlocked per successful referral, in percent. */
export const PCT_PER_REFERRAL = 2.5;
/** List price of the Smart Lock the discount applies to, in EUR. */
export const SMART_LOCK_LIST_PRICE_EUR = 200;

/** Progress-bar cell colours, from the Classical design tokens in the handoff. */
const CELL_FILLED = "#b68235";
const CELL_EMPTY = "#eae7e7";

export type ReferralRewards = {
  /** Referral count clamped to [0, MAX_REFERRALS]. */
  count: number;
  /** Discount unlocked so far, in percent (e.g. 7.5). */
  pct: number;
  /** Money saved off the list price, in whole EUR. */
  saving: number;
  /** Discount after one more referral; equals `pct` once at maximum. */
  nextPct: number;
  /** The 10-cell progress bar as an HTML `<td>` run. */
  progressBarHtml: string;
};

/**
 * Clamp a raw count into the rewardable range. Negative counts (corrupt data)
 * floor at 0 and anything past the cap saturates, so an over-credited contact
 * can never be shown more than the advertised maximum 25%.
 */
function clampCount(rawCount: number): number {
  if (!Number.isFinite(rawCount)) return 0;
  return Math.min(Math.max(Math.trunc(rawCount), 0), MAX_REFERRALS);
}

/**
 * Build the 10-cell progress bar. Emitted server-side rather than as Mautic
 * Dynamic Content blocks because the filled-cell count varies per contact and
 * conditional blocks would need one variant per tier.
 *
 * Kept byte-identical to the static bars the designer authored in the other four
 * emails, so all five states line up pixel-for-pixel in the inbox.
 */
export function buildProgressBarHtml(rawCount: number): string {
  const filled = clampCount(rawCount);
  let html = "";
  for (let i = 0; i < MAX_REFERRALS; i++) {
    const color = i < filled ? CELL_FILLED : CELL_EMPTY;
    html += `<td style="height:8px;background-color:${color};border-left:2px solid #ffffff"></td>`;
  }
  return html;
}

/**
 * The contact's personal referral URL, in their own language.
 *
 * Must stay identical to the link the success page shows them
 * (src/components/early-access/referral-tools.tsx) — a referrer who compares the
 * link in the email against the one they copied from the site should see the
 * same string, and the two drifting apart would split attribution.
 */
export function buildReferralLink(args: {
  baseUrl: string;
  referralCode: string;
  preferredLanguage?: string | null;
}): string {
  const locale: Locale =
    args.preferredLanguage && isLocale(args.preferredLanguage)
      ? args.preferredLanguage
      : defaultLocale;
  const base = args.baseUrl.replace(/\/$/, "");
  return `${base}/${locale}/early-access?ref=${encodeURIComponent(args.referralCode)}`;
}

/**
 * Project a referral count onto the reward values the emails print.
 *
 * `saving` is rounded to whole euros because the emails render it as "EUR 45"
 * with no decimal place; at 2.5% of 200 every tier lands on a whole number
 * anyway (EUR 5 per referral), so rounding never actually fires today — it is
 * there so a future price or rate change cannot leak "EUR 47.5" into an email.
 */
export function computeReferralRewards(rawCount: number): ReferralRewards {
  const count = clampCount(rawCount);
  const pct = count * PCT_PER_REFERRAL;
  const nextPct = Math.min(count + 1, MAX_REFERRALS) * PCT_PER_REFERRAL;
  return {
    count,
    pct,
    saving: Math.round((pct / 100) * SMART_LOCK_LIST_PRICE_EUR),
    nextPct,
    progressBarHtml: buildProgressBarHtml(count),
  };
}

/**
 * The Mautic contact-field payload for a referral state.
 *
 * Aliases are the ones provisioned in deploy/mautic/provision.sh §1. Two of them
 * are deliberately not what the handoff README asked for:
 *   - the count is the pre-existing `verified_referral_count`, not a second
 *     `referral_count` field that would have to be kept in sync forever;
 *   - the bar is `referral_progress_html` (22 chars), because Mautic truncates
 *     field aliases at 25 characters and then silently creates a duplicate
 *     field on the next provisioning run.
 */
export function mapRewardsToMauticFields(args: {
  rewards: ReferralRewards;
  referralLink?: string | null;
}): Record<string, string | number> {
  const fields: Record<string, string | number> = {
    verified_referral_count: args.rewards.count,
    referral_pct: args.rewards.pct,
    referral_saving: args.rewards.saving,
    referral_next_pct: args.rewards.nextPct,
    referral_progress_html: args.rewards.progressBarHtml,
  };
  // Never blank an existing link: a contact whose code we could not read keeps
  // whatever URL Mautic already holds rather than getting an empty button href.
  if (args.referralLink) fields.referral_link = args.referralLink;
  return fields;
}
