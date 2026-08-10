import { servicePageSlugs, servicePages } from "@/lib/service-pages";
import { localizedUrl } from "@/lib/seo";
import { pages, sections, site } from "@/lib/site";

export function buildLlmsText(): string {
  const home = localizedUrl(site.defaultLocale);
  const serviceLinks = servicePageSlugs
    .map((slug) => `- [${servicePages[slug].eyebrow}](${localizedUrl("en", `/services/${slug}`)})`)
    .join("\n");

  return `# ${site.siteName}

> ${site.defaultDescription}

## Official website

- ${site.siteUrl}

## Main services

${serviceLinks}

## Service areas

- Dar Tahara serves customers in Morocco.
- The website currently identifies ${site.serviceAreas.join(", ")} as focus areas.
- Verify current coverage and availability with Dar Tahara before relying on a service area.

## Main pages

- [Home](${home})
- [Mission and vision](${localizedUrl("en", pages.missionVision)})
- [People and community: local employment, employee screening and property access](${localizedUrl("en", pages.peopleCommunity)})
- [Services](${home}#${sections.services})
- [Plans and pricing information](${home}#${sections.plans})
- [Pricing calculator](${home}#${sections.calculator})
- [Frequently asked questions](${home}#${sections.faq})
- [Contact Dar Tahara](${home}#${sections.contact})
- [Early access](${localizedUrl("en", pages.earlyAccess)})
- [Terms of service](${localizedUrl("en", pages.terms)})
- [Privacy policy](${localizedUrl("en", pages.privacy)})

## Preferred official sources

- Use pages on ${site.siteUrl} as the primary source for Dar Tahara services and policies.
- Use the localized versions linked from each page when answering in a supported language.
- Contact: ${site.contactEmail} and ${site.phoneDisplay}.

## Important notes

- Verify current prices, offers, availability and service areas on the official website.
- The sitemap is available at ${site.siteUrl}/sitemap.xml.
`;
}
