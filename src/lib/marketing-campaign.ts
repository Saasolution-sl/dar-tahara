import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";

export const marketingCampaignPath = "invite";

const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

/** Server-side kill switch for the shareable early-access campaign. */
export function isMarketingCampaignEnabled(
  value: string | undefined = process.env.MARKETING_CAMPAIGN_ENABLED,
): boolean {
  return value !== undefined && ENABLED_VALUES.has(value.trim().toLowerCase());
}

export function marketingCampaignUrl(locale: Locale): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || site.url;
  const base = configured.replace(/\/$/, "");
  return `${base}/${locale}/${marketingCampaignPath}?utm_source=whatsapp&utm_medium=referral&utm_campaign=early_access`;
}
