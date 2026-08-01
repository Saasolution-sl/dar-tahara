/**
 * Central site configuration — single source of truth for URLs, contact
 * details and social links. Update here to change site-wide references.
 */
import { defaultLocale, locales } from "@/i18n/config";

const siteName = "Dar Tahara";
const siteUrl = "https://www.dartahara.com";
const defaultDescription =
  "Dar Tahara is a premium home care and property concierge in Morocco. Professional cleaning, inspections and maintenance so you always arrive home to comfort.";

export const site = {
  siteName,
  siteUrl,
  defaultLocale,
  supportedLocales: locales,
  defaultTitle: "Dar Tahara — Premium Home Care & Property Concierge",
  titleTemplate: `%s | ${siteName}`,
  defaultDescription,
  logoUrl: `${siteUrl}/icon.svg`,
  defaultSocialImage: `${siteUrl}/${defaultLocale}/opengraph-image`,
  contactEmail: "hello@dartahara.com",
  telephone: "+212623875315",

  // Backwards-compatible aliases used by existing application modules.
  name: siteName,
  domain: "www.dartahara.com",
  url: siteUrl,
  email: "hello@dartahara.com",
  phoneDisplay: "+212 6 23875315",
  phoneE164: "+212623875315",
  whatsappE164: "212623875315",
  whatsappMessage: "Hello Dar Tahara, I would like to learn more about your home care services.",
  addressLocality: "Tangier",
  addressCountry: "MA",
  serviceAreas: ["Tetouan", "Tangier", "Meknes", "Casablanca"],
  socials: {
    instagram: "https://www.instagram.com/dartaharaservices",
    facebook: "https://www.facebook.com/dartaharaservices/",
    linkedin: "https://linkedin.com/company/dartahara",
  },
} as const;

export function whatsappLink(message: string = site.whatsappMessage) {
  return `https://wa.me/${site.whatsappE164}?text=${encodeURIComponent(message)}`;
}

/**
 * Standalone content pages, appended after the locale segment
 * (e.g. `/en/missionandvision`). Single source of truth for nav, footer,
 * sitemap and canonical URLs.
 */
export const pages = {
  missionVision: "/missionandvision",
  privacy: "/privacy",
  terms: "/terms",
  earlyAccess: "/early-access",
  services: "/services",
} as const;

/** In-page section anchors — shared by nav and section ids. */
export const sections = {
  why: "why",
  services: "services",
  plans: "plans",
  calculator: "calculator",
  how: "how",
  audiences: "audiences",
  gallery: "gallery",
  faq: "faq",
  contact: "contact",
} as const;
