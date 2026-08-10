import * as React from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { PublicFeatureState } from "@/lib/feature-flags";
import { peopleCommunityLinks } from "./cta-links";
import { PeopleCommunityHero } from "./hero";
import { LocalEmploymentSection } from "./local-employment";
import { EmployeeStabilitySection } from "./employee-stability";
import { EmployeeScreeningSection } from "./screening";
import { ControlledAccessSection } from "./controlled-access";
import { AccessTransparencySection } from "./access-transparency";
import { TrustStatement } from "./trust-statement";
import { CommunityImpactSection } from "./community-impact";
import { PeopleCommunityClosing } from "./closing";

/**
 * People & Community: how Dar Tahara's employment model and its property-access
 * model are the same promise seen from two sides. Section order follows the
 * narrative, community first, then trust, then the two joined together.
 */
export function PeopleCommunity({
  locale,
  dict,
  features,
}: {
  locale: Locale;
  dict: Dictionary;
  features: PublicFeatureState;
}) {
  const copy = dict.peopleCommunity;
  const links = peopleCommunityLinks({
    locale,
    dict,
    features,
    primaryLabel: copy.hero.ctaPrimary,
  });

  return (
    <>
      <PeopleCommunityHero
        locale={locale}
        copy={copy}
        links={links}
        secondaryLabel={copy.hero.ctaSecondary}
      />
      <LocalEmploymentSection copy={copy.employment} />
      <EmployeeStabilitySection copy={copy.stability} />
      <EmployeeScreeningSection copy={copy.screening} />
      <ControlledAccessSection copy={copy.access} />
      <AccessTransparencySection copy={copy.transparency} />
      <TrustStatement copy={copy.trust} />
      <CommunityImpactSection copy={copy.impact} />
      <PeopleCommunityClosing
        copy={copy.closing}
        links={
          links.usesEarlyAccess
            ? { ...links, primaryLabel: copy.closing.ctaPrimary }
            : links
        }
        secondaryLabel={copy.closing.ctaSecondary}
      />
    </>
  );
}
