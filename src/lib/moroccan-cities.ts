/**
 * Moroccan cities Dar Tahara serves or intends to serve.
 *
 * This exists so search engines and AI systems have a crawlable, honest
 * reference for the geography of the business. It is deliberately NOT a
 * generator for per-city landing pages: thirty near-identical pages for a
 * service that cannot yet be booked in those cities is a doorway-page pattern,
 * and it would imply availability the business does not have.
 *
 * `status` is the whole point of this file. Every city renders with its status
 * visible, so neither a customer nor a language model can read the list as a
 * claim that the service is live everywhere.
 *
 * When a city genuinely launches: flip it to "available" here, and only then
 * consider giving it its own page with real local content.
 */

/** Live focus areas are the single source of truth in `site.serviceAreas`. */
export const CITY_STATUSES = ["available", "expanding", "planned"] as const;
export type CityStatus = (typeof CITY_STATUSES)[number];

export type MoroccanCity = {
  /** Latin-script name, used for every locale except Arabic. */
  name: string;
  /** Arabic name, so the RTL locale does not read as a list of foreign words. */
  nameAr: string;
  /** Administrative region, for grouping and geographic context. */
  region: string;
  status: CityStatus;
};

/**
 * "available" mirrors `site.serviceAreas`. "expanding" is the near-term
 * rollout around those areas. Everything else is "planned" - a stated intent,
 * not an offer.
 */
export const MOROCCAN_CITIES: MoroccanCity[] = [
  // ── Live focus areas ──────────────────────────────────────────────────────
  { name: "Tangier", nameAr: "طنجة", region: "Tanger-Tetouan-Al Hoceima", status: "available" },
  { name: "Tetouan", nameAr: "تطوان", region: "Tanger-Tetouan-Al Hoceima", status: "available" },
  { name: "Casablanca", nameAr: "الدار البيضاء", region: "Casablanca-Settat", status: "available" },
  { name: "Meknes", nameAr: "مكناس", region: "Fès-Meknès", status: "available" },

  // ── Near-term expansion ───────────────────────────────────────────────────
  { name: "Rabat", nameAr: "الرباط", region: "Rabat-Salé-Kénitra", status: "expanding" },
  { name: "Salé", nameAr: "سلا", region: "Rabat-Salé-Kénitra", status: "expanding" },
  { name: "Fès", nameAr: "فاس", region: "Fès-Meknès", status: "expanding" },
  { name: "Marrakesh", nameAr: "مراكش", region: "Marrakech-Safi", status: "expanding" },
  { name: "M'diq", nameAr: "المضيق", region: "Tanger-Tetouan-Al Hoceima", status: "expanding" },
  { name: "Fnideq", nameAr: "الفنيدق", region: "Tanger-Tetouan-Al Hoceima", status: "expanding" },
  { name: "Martil", nameAr: "مرتيل", region: "Tanger-Tetouan-Al Hoceima", status: "expanding" },
  { name: "Asilah", nameAr: "أصيلة", region: "Tanger-Tetouan-Al Hoceima", status: "expanding" },
  { name: "Mohammedia", nameAr: "المحمدية", region: "Casablanca-Settat", status: "expanding" },

  // ── Planned ───────────────────────────────────────────────────────────────
  { name: "Agadir", nameAr: "أكادير", region: "Souss-Massa", status: "planned" },
  { name: "Kenitra", nameAr: "القنيطرة", region: "Rabat-Salé-Kénitra", status: "planned" },
  { name: "Temara", nameAr: "تمارة", region: "Rabat-Salé-Kénitra", status: "planned" },
  { name: "Oujda", nameAr: "وجدة", region: "Oriental", status: "planned" },
  { name: "Nador", nameAr: "الناظور", region: "Oriental", status: "planned" },
  { name: "Berkane", nameAr: "بركان", region: "Oriental", status: "planned" },
  { name: "Al Hoceima", nameAr: "الحسيمة", region: "Tanger-Tetouan-Al Hoceima", status: "planned" },
  { name: "Chefchaouen", nameAr: "شفشاون", region: "Tanger-Tetouan-Al Hoceima", status: "planned" },
  { name: "Larache", nameAr: "العرائش", region: "Tanger-Tetouan-Al Hoceima", status: "planned" },
  { name: "Ksar El Kebir", nameAr: "القصر الكبير", region: "Tanger-Tetouan-Al Hoceima", status: "planned" },
  { name: "El Jadida", nameAr: "الجديدة", region: "Casablanca-Settat", status: "planned" },
  { name: "Settat", nameAr: "سطات", region: "Casablanca-Settat", status: "planned" },
  { name: "Berrechid", nameAr: "برشيد", region: "Casablanca-Settat", status: "planned" },
  { name: "Safi", nameAr: "آسفي", region: "Marrakech-Safi", status: "planned" },
  { name: "Essaouira", nameAr: "الصويرة", region: "Marrakech-Safi", status: "planned" },
  { name: "Beni Mellal", nameAr: "بني ملال", region: "Béni Mellal-Khénifra", status: "planned" },
  { name: "Khouribga", nameAr: "خريبكة", region: "Béni Mellal-Khénifra", status: "planned" },
  { name: "Ifrane", nameAr: "إفران", region: "Fès-Meknès", status: "planned" },
  { name: "Taza", nameAr: "تازة", region: "Fès-Meknès", status: "planned" },
  { name: "Sefrou", nameAr: "صفرو", region: "Fès-Meknès", status: "planned" },
  { name: "Taroudant", nameAr: "تارودانت", region: "Souss-Massa", status: "planned" },
  { name: "Tiznit", nameAr: "تزنيت", region: "Souss-Massa", status: "planned" },
  { name: "Ouarzazate", nameAr: "ورزازات", region: "Drâa-Tafilalet", status: "planned" },
  { name: "Errachidia", nameAr: "الرشيدية", region: "Drâa-Tafilalet", status: "planned" },
  { name: "Laayoune", nameAr: "العيون", region: "Laâyoune-Sakia El Hamra", status: "planned" },
  { name: "Dakhla", nameAr: "الداخلة", region: "Dakhla-Oued Ed-Dahab", status: "planned" },
];

/** City name for a locale. Only Arabic differs; the rest use Latin script. */
export function cityName(city: MoroccanCity, locale: string): string {
  return locale === "ar" ? city.nameAr : city.name;
}

export function citiesByStatus(status: CityStatus): MoroccanCity[] {
  return MOROCCAN_CITIES.filter((city) => city.status === status);
}

/** Distinct regions in list order, for grouping the planned coverage map. */
export function regions(): string[] {
  return [...new Set(MOROCCAN_CITIES.map((city) => city.region))];
}
