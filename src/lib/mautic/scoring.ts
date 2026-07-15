/**
 * Dar Tahara lead scoring — the field-based half of the model (brief §22).
 *
 * Mautic's native "point actions" only fire on BEHAVIOUR (email opens, link
 * clicks, page returns); those live in Mautic. The rules below score a lead from
 * its SUBMITTED DATA (verification, city, frequency, access, referrals), which
 * Mautic points can't express. We compute them here at sync time and write the
 * total to the contact's `points` field, so behavioural points (added in Mautic)
 * and data points (added here) accumulate on the same score.
 *
 * Everything is a pure function of the lead + a config object, so the model is
 * documented in one place and trivially adjustable (change RULES / LAUNCH_CITIES)
 * and unit-tested. No I/O, no Mautic calls.
 */
import type { LeadForSync } from "./types";

/** Cities where service is launching/active — property here is high intent. */
export const LAUNCH_CITIES = [
  "tangier", "tetouan", "fnideq", "casablanca", "rabat", "marrakech",
];

/** Every rule's weight in one adjustable place. */
export const SCORE_RULES = {
  emailVerified: 20,
  validWhatsapp: 10,
  propertyAddressCompleted: 10,
  propertyInLaunchCity: 15,
  startWithinOneMonth: 20,
  frequencyWeekly: 15,
  frequencyBiweekly: 10,
  frequencyMonthly: 8,
  multipleServices: 5,
  digitalLock: 5,
  referralSignup: 5,
  perVerifiedReferral: 10,
  verifiedReferralCap: 50, // max contribution from referrals
} as const;

export type ScoreBreakdown = { rule: keyof typeof SCORE_RULES; points: number }[];

function isPlausibleE164(v?: string | null): boolean {
  return typeof v === "string" && /^\+\d{8,15}$/.test(v);
}

/**
 * Compute a lead's data-driven score with an itemised breakdown. `cleaningCity`
 * is matched case-insensitively against LAUNCH_CITIES.
 */
export function computeLeadScore(
  lead: LeadForSync,
  cfg: { launchCities?: string[]; rules?: typeof SCORE_RULES } = {},
): { score: number; breakdown: ScoreBreakdown } {
  const R = cfg.rules ?? SCORE_RULES;
  const cities = (cfg.launchCities ?? LAUNCH_CITIES).map((c) => c.toLowerCase());
  const breakdown: ScoreBreakdown = [];
  const add = (rule: keyof typeof SCORE_RULES, points: number) => {
    if (points !== 0) breakdown.push({ rule, points });
  };

  if (lead.emailVerified) add("emailVerified", R.emailVerified);
  if (isPlausibleE164(lead.whatsappPhone)) add("validWhatsapp", R.validWhatsapp);

  // "Property address completed" — we key on the summary city being present
  // (the exact address lives in Supabase; the sync only carries the city).
  if (lead.cleaningCity && lead.cleaningCity.trim()) {
    add("propertyAddressCompleted", R.propertyAddressCompleted);
    if (cities.includes(lead.cleaningCity.trim().toLowerCase())) {
      add("propertyInLaunchCity", R.propertyInLaunchCity);
    }
  }

  if (lead.expectedStartPeriod === "within_1_month") add("startWithinOneMonth", R.startWithinOneMonth);

  switch (lead.desiredFrequency) {
    case "weekly": add("frequencyWeekly", R.frequencyWeekly); break;
    case "biweekly": add("frequencyBiweekly", R.frequencyBiweekly); break;
    case "monthly": add("frequencyMonthly", R.frequencyMonthly); break;
  }

  if ((lead.desiredServices?.length ?? 0) > 1) add("multipleServices", R.multipleServices);
  if (lead.hasDigitalLock) add("digitalLock", R.digitalLock);
  if (lead.referredByCode && lead.referredByCode.trim()) add("referralSignup", R.referralSignup);

  const referrals = Math.max(0, lead.verifiedReferralCount ?? 0);
  if (referrals > 0) {
    const raw = referrals * R.perVerifiedReferral;
    add("perVerifiedReferral", Math.min(raw, R.verifiedReferralCap));
  }

  const score = breakdown.reduce((sum, b) => sum + b.points, 0);
  return { score, breakdown };
}

/**
 * Derive the lifecycle stage from the lead + its score (brief §22 stages). Used
 * to keep early_access_status coherent with intent.
 */
export function deriveStage(lead: LeadForSync, score: number): string {
  if (!lead.emailVerified) return "early_access_submitted";
  // Verified but property is outside a launch city → service-area waitlist.
  const inLaunch = lead.cleaningCity
    ? LAUNCH_CITIES.includes(lead.cleaningCity.trim().toLowerCase())
    : false;
  if (!inLaunch) return "service_area_waitlist";
  // Verified, in a launch city, strong score → marketing-qualified.
  if (score >= 50) return "marketing_qualified_lead";
  return "email_verified";
}
