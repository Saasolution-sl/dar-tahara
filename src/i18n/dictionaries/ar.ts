import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** Arabic (RTL) — key marketing strings translated; remaining keys fall back to English. */
const ar: DeepPartial<Dictionary> = {
  meta: {
    title: "دار طهارة — عناية منزلية راقية وخدمة كونسيرج للعقارات",
    description:
      "دار طهارة خدمة كونسيرج وعناية منزلية راقية في المغرب. تنظيف احترافي ومعاينة وصيانة لتعود دائمًا إلى منزل يبعث على الراحة.",
  },
  brand: {
    meaning: "بيت الطهارة",
    tagline: "عُد دائمًا إلى الراحة.",
  },
  nav: {
    why: "لماذا دار طهارة",
    services: "الخدمات",
    plans: "الباقات",
    how: "كيف نعمل",
    gallery: "المعرض",
    faq: "الأسئلة الشائعة",
    book: "احجز تنظيفًا",
    quote: "اطلب عرض سعر",
    menu: "القائمة",
    close: "إغلاق",
    language: "اللغة",
    theme: "المظهر",
  },
  hero: {
    eyebrow: "عناية منزلية وخدمة كونسيرج",
    title: "منزلك يستحق أكثر من مجرد تنظيف — يستحق عناية استثنائية.",
    subtitle:
      "لأصحاب المنازل والمغتربين وملّاك بيوت العطلات في المغرب. ننظّف ونعاين ونعتني بعقارك بدقة هادئة لتعود إلى الراحة لا إلى القلق.",
    ctaPrimary: "احجز تنظيفًا",
    ctaSecondary: "اطلب عرض سعر",
    ctaTertiary: "اعرف المزيد",
  },
  cta: {
    title: "عُد دائمًا إلى الراحة.",
    ctaPrimary: "احجز تنظيفًا",
    ctaSecondary: "اطلب عرض سعر",
    whatsapp: "تواصل عبر واتساب",
  },
};

export default ar;
