import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** German — starter translations; remaining keys fall back to English. */
const de: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara — Premium-Hauspflege & Immobilien-Concierge",
    description:
      "Dar Tahara ist ein Premium-Service für Hauspflege und Immobilien-Concierge in Marokko. Professionelle Reinigung, Inspektionen und Wartung.",
  },
  brand: { meaning: "Haus der Reinheit", tagline: "Kommen Sie immer nach Hause zum Komfort." },
  nav: {
    why: "Warum Dar Tahara",
    services: "Leistungen",
    plans: "Abos",
    how: "So funktioniert’s",
    gallery: "Galerie",
    faq: "FAQ",
    book: "Reinigung buchen",
    quote: "Angebot anfordern",
    language: "Sprache",
    theme: "Design",
  },
  hero: {
    eyebrow: "Hauspflege & Concierge",
    title: "Ihr Zuhause verdient mehr als Reinigung — es verdient außergewöhnliche Pflege.",
    subtitle:
      "Für Eigentümer, Expats und Ferienhausbesitzer in Marokko. Wir reinigen, prüfen und pflegen Ihre Immobilie mit stiller Präzision.",
    ctaPrimary: "Reinigung buchen",
    ctaSecondary: "Angebot anfordern",
    ctaTertiary: "Mehr erfahren",
  },
  cta: {
    title: "Kommen Sie immer nach Hause zum Komfort.",
    ctaPrimary: "Reinigung buchen",
    ctaSecondary: "Angebot anfordern",
    whatsapp: "Auf WhatsApp chatten",
  },
};

export default de;
