import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** Dutch — starter translations; remaining keys fall back to English. */
const nl: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara — Premium woningverzorging & vastgoedconciërge",
    description:
      "Dar Tahara is een premium woningverzorging en vastgoedconciërge in Marokko. Professioneel schoonmaken, inspecties en onderhoud.",
  },
  brand: { meaning: "Huis van Zuiverheid", tagline: "Kom altijd thuis in comfort." },
  nav: {
    why: "Waarom Dar Tahara",
    services: "Diensten",
    plans: "Abonnementen",
    how: "Hoe het werkt",
    gallery: "Galerij",
    faq: "Veelgestelde vragen",
    book: "Schoonmaak boeken",
    quote: "Offerte aanvragen",
    language: "Taal",
    theme: "Thema",
  },
  hero: {
    eyebrow: "Woningverzorging & conciërge",
    title: "Uw huis verdient meer dan schoonmaken—het verdient uitzonderlijke zorg.",
    subtitle:
      "Voor huiseigenaren, expats en eigenaren van vakantiewoningen in Marokko. Wij reinigen, inspecteren en onderhouden uw woning met stille precisie.",
    ctaPrimary: "Schoonmaak boeken",
    ctaSecondary: "Offerte aanvragen",
    ctaTertiary: "Meer weten",
  },
  cta: {
    title: "Kom altijd thuis in comfort.",
    ctaPrimary: "Schoonmaak boeken",
    ctaSecondary: "Offerte aanvragen",
    whatsapp: "Chat op WhatsApp",
  },
};

export default nl;
