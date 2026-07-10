import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** Portuguese — starter translations; remaining keys fall back to English. */
const pt: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara — Cuidado premium do lar e concierge de imóveis",
    description:
      "Dar Tahara é um serviço premium de cuidado do lar e concierge de imóveis em Marrocos. Limpeza profissional, inspeções e manutenção.",
  },
  brand: { meaning: "Casa da Pureza", tagline: "Chegue sempre a um lar de conforto." },
  nav: {
    why: "Porquê Dar Tahara",
    services: "Serviços",
    plans: "Planos",
    how: "Como funciona",
    gallery: "Galeria",
    faq: "Perguntas frequentes",
    book: "Reservar limpeza",
    quote: "Pedir orçamento",
    language: "Idioma",
    theme: "Tema",
  },
  hero: {
    eyebrow: "Cuidado do lar e concierge",
    title: "A sua casa merece mais do que limpeza — merece um cuidado excecional.",
    subtitle:
      "Para proprietários, expatriados e donos de casas de férias em Marrocos. Limpamos, inspecionamos e mantemos o seu imóvel com precisão discreta.",
    ctaPrimary: "Reservar limpeza",
    ctaSecondary: "Pedir orçamento",
    ctaTertiary: "Saber mais",
  },
  cta: {
    title: "Chegue sempre a um lar de conforto.",
    ctaPrimary: "Reservar limpeza",
    ctaSecondary: "Pedir orçamento",
    whatsapp: "Conversar no WhatsApp",
  },
};

export default pt;
