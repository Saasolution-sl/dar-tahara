import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** French — key marketing strings translated; remaining keys fall back to English. */
const fr: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara — Conciergerie & entretien de résidence premium",
    description:
      "Dar Tahara est une conciergerie résidentielle premium au Maroc. Nettoyage professionnel, inspections et entretien pour rentrer toujours dans un intérieur parfait.",
  },
  brand: {
    meaning: "Maison de la Pureté",
    tagline: "Rentrez toujours dans le confort.",
  },
  nav: {
    why: "Pourquoi Dar Tahara",
    services: "Services",
    plans: "Formules",
    how: "Comment ça marche",
    gallery: "Galerie",
    faq: "FAQ",
    book: "Réserver un ménage",
    quote: "Demander un devis",
    language: "Langue",
    theme: "Thème",
  },
  hero: {
    eyebrow: "Entretien & conciergerie de résidence",
    title: "Votre maison mérite mieux qu’un ménage — elle mérite un soin d’exception.",
    subtitle:
      "Pour les propriétaires, expatriés et propriétaires de résidences secondaires au Maroc. Nous nettoyons, inspectons et entretenons votre bien avec une précision discrète.",
    ctaPrimary: "Réserver un ménage",
    ctaSecondary: "Demander un devis",
    ctaTertiary: "En savoir plus",
  },
  cta: {
    title: "Rentrez toujours dans le confort.",
    ctaPrimary: "Réserver un ménage",
    ctaSecondary: "Demander un devis",
    whatsapp: "Discuter sur WhatsApp",
  },
};

export default fr;
