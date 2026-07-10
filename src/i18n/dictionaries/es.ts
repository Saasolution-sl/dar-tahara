import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** Spanish — starter translations; remaining keys fall back to English. */
const es: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara — Cuidado del hogar y conserjería de propiedades premium",
    description:
      "Dar Tahara es un servicio premium de cuidado del hogar y conserjería en Marruecos. Limpieza profesional, inspecciones y mantenimiento.",
  },
  brand: { meaning: "Casa de la Pureza", tagline: "Llega siempre a un hogar de confort." },
  nav: {
    why: "Por qué Dar Tahara",
    services: "Servicios",
    plans: "Planes",
    how: "Cómo funciona",
    gallery: "Galería",
    faq: "Preguntas frecuentes",
    book: "Reservar limpieza",
    quote: "Solicitar presupuesto",
    language: "Idioma",
    theme: "Tema",
  },
  hero: {
    eyebrow: "Cuidado del hogar y conserjería",
    title: "Tu hogar merece más que limpieza: merece un cuidado excepcional.",
    subtitle:
      "Para propietarios, expatriados y dueños de casas vacacionales en Marruecos. Limpiamos, inspeccionamos y mantenemos tu propiedad con precisión discreta.",
    ctaPrimary: "Reservar limpieza",
    ctaSecondary: "Solicitar presupuesto",
    ctaTertiary: "Saber más",
  },
  cta: {
    title: "Llega siempre a un hogar de confort.",
    ctaPrimary: "Reservar limpieza",
    ctaSecondary: "Solicitar presupuesto",
    whatsapp: "Chatear por WhatsApp",
  },
};

export default es;
