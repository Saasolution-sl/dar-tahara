/**
 * Central site configuration — single source of truth for URLs, contact
 * details and social links. Update here to change site-wide references.
 */
export const site = {
  name: "Dar Tahara",
  domain: "dartahara.com",
  url: "https://dartahara.com",
  email: "hello@dartahara.com",
  phoneDisplay: "+212 6 00 00 00 00",
  phoneE164: "+212600000000",
  whatsappE164: "212600000000",
  whatsappMessage: "Hello Dar Tahara, I would like to learn more about your home care services.",
  addressLocality: "Tangier",
  addressCountry: "MA",
  socials: {
    instagram: "https://instagram.com/dartahara",
    facebook: "https://facebook.com/dartahara",
    linkedin: "https://linkedin.com/company/dartahara",
  },
} as const;

export function whatsappLink(message: string = site.whatsappMessage) {
  return `https://wa.me/${site.whatsappE164}?text=${encodeURIComponent(message)}`;
}

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
