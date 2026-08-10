import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { pages, sections } from "@/lib/site";
import type { PublicFeatureState } from "@/lib/feature-flags";

export interface PeopleCommunityLinks {
  /** Primary call to action, locale-preserving. */
  primaryHref: string;
  primaryLabel: string;
  /** Secondary call to action, always the sibling Mission & Vision page. */
  secondaryHref: string;
  /**
   * False when a feature flag replaced the early-access action with a fallback.
   * Callers must then keep `primaryLabel` instead of substituting their own.
   */
  usesEarlyAccess: boolean;
}

/**
 * Resolve the page's calls to action from the existing feature-flag state, so
 * the People & Community page never hardcodes a duplicate destination.
 *
 * Early access is the intended primary action while the programme is open. If
 * it is switched off, we fall back to the same chain the Mission & Vision page
 * uses: the pricing calculator when assessment booking is live, otherwise the
 * flag's own configured fallback.
 */
export function peopleCommunityLinks({
  locale,
  dict,
  features,
  primaryLabel,
}: {
  locale: Locale;
  dict: Dictionary;
  features: PublicFeatureState;
  primaryLabel: string;
}): PeopleCommunityLinks {
  const base = `/${locale}`;

  if (features.earlyAccessEnabled) {
    return {
      primaryHref: `${base}${pages.earlyAccess}`,
      primaryLabel,
      secondaryHref: `${base}${pages.missionVision}`,
      usesEarlyAccess: true,
    };
  }

  return {
    primaryHref: features.assessmentBookingEnabled
      ? `${base}#${sections.calculator}`
      : features.fallbackUrl,
    primaryLabel: features.assessmentBookingEnabled
      ? dict.hero.ctaPrimary
      : features.fallbackLabel,
    secondaryHref: `${base}${pages.missionVision}`,
    usesEarlyAccess: false,
  };
}
