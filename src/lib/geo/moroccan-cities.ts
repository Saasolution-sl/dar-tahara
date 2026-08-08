/**
 * Canonical Moroccan cities, the SINGLE source of truth for standardized city
 * data across the site (form selector, validation, storage, Mautic reporting).
 *
 * Each city has one stable `id` and one `canonicalName`; language variants and
 * common spellings are `aliases` so that "Tanger", "Tangier", "Tánger" and
 * "طنجة" all resolve to the same reporting value instead of fragmenting.
 *
 * `serviceAreaStatus` is BUSINESS configuration, operators should keep it in
 * step with the real operational area (ideally sourced from the ops backend
 * later). A non-active status NEVER blocks an early-access registration; it only
 * drives messaging ("coming soon" / "waiting list") and segmentation.
 *
 * This is deliberately NOT an exhaustive list of Moroccan cities: anything not
 * listed is captured via the "my city is not listed" manual path and flagged for
 * internal review, never silently added to this canonical list.
 */
import type { Locale } from "@/i18n/config";

export type ServiceAreaStatus = "active" | "planned" | "waiting_list" | "unsupported";

export type MoroccanCity = {
  id: string;
  canonicalName: string;
  regionId: string;
  regionName: string;
  localizedNames?: Partial<Record<Locale, string>>;
  aliases?: string[];
  serviceAreaStatus: ServiceAreaStatus;
};

/** Sentinel id for "my city is not listed" → manual, unverified entry. */
export const OTHER_CITY_ID = "__other__";

export const MOROCCAN_CITIES: readonly MoroccanCity[] = [
  {
    id: "casablanca",
    canonicalName: "Casablanca",
    regionId: "casablanca_settat",
    regionName: "Casablanca-Settat",
    localizedNames: { ar: "الدار البيضاء" },
    aliases: ["Casa", "Dar el Beida", "Dar Bida", "الدار البيضاء", "كازابلانكا"],
    serviceAreaStatus: "active",
  },
  {
    id: "tangier",
    canonicalName: "Tangier",
    regionId: "tanger_tetouan_al_hoceima",
    regionName: "Tanger-Tétouan-Al Hoceïma",
    localizedNames: { fr: "Tanger", es: "Tánger", de: "Tanger", nl: "Tanger", pt: "Tânger", ar: "طنجة" },
    aliases: ["Tanger", "Tánger", "Tanja", "طنجة"],
    serviceAreaStatus: "active",
  },
  {
    id: "tetouan",
    canonicalName: "Tetouan",
    regionId: "tanger_tetouan_al_hoceima",
    regionName: "Tanger-Tétouan-Al Hoceïma",
    localizedNames: { fr: "Tétouan", es: "Tetuán", ar: "تطوان" },
    aliases: ["Tétouan", "Tetuán", "Titwan", "تطوان"],
    serviceAreaStatus: "active",
  },
  {
    id: "asilah",
    canonicalName: "Asilah",
    regionId: "tanger_tetouan_al_hoceima",
    regionName: "Tanger-Tétouan-Al Hoceïma",
    localizedNames: { ar: "أصيلة" },
    aliases: ["Arzila", "Arcila", "أصيلة"],
    serviceAreaStatus: "planned",
  },
  {
    id: "chefchaouen",
    canonicalName: "Chefchaouen",
    regionId: "tanger_tetouan_al_hoceima",
    regionName: "Tanger-Tétouan-Al Hoceïma",
    localizedNames: { ar: "شفشاون" },
    aliases: ["Chaouen", "Xauen", "شفشاون", "الشاون"],
    serviceAreaStatus: "waiting_list",
  },
  {
    id: "al_hoceima",
    canonicalName: "Al Hoceima",
    regionId: "tanger_tetouan_al_hoceima",
    regionName: "Tanger-Tétouan-Al Hoceïma",
    localizedNames: { es: "Alhucemas", ar: "الحسيمة" },
    aliases: ["Alhucemas", "Al-Hoceima", "الحسيمة"],
    serviceAreaStatus: "waiting_list",
  },
  {
    id: "rabat",
    canonicalName: "Rabat",
    regionId: "rabat_sale_kenitra",
    regionName: "Rabat-Salé-Kénitra",
    localizedNames: { ar: "الرباط" },
    aliases: ["الرباط"],
    serviceAreaStatus: "planned",
  },
  {
    id: "sale",
    canonicalName: "Salé",
    regionId: "rabat_sale_kenitra",
    regionName: "Rabat-Salé-Kénitra",
    localizedNames: { ar: "سلا" },
    aliases: ["Sale", "سلا"],
    serviceAreaStatus: "planned",
  },
  {
    id: "kenitra",
    canonicalName: "Kenitra",
    regionId: "rabat_sale_kenitra",
    regionName: "Rabat-Salé-Kénitra",
    localizedNames: { fr: "Kénitra", ar: "القنيطرة" },
    aliases: ["Kénitra", "القنيطرة"],
    serviceAreaStatus: "waiting_list",
  },
  {
    id: "mohammedia",
    canonicalName: "Mohammedia",
    regionId: "casablanca_settat",
    regionName: "Casablanca-Settat",
    localizedNames: { ar: "المحمدية" },
    aliases: ["المحمدية"],
    serviceAreaStatus: "planned",
  },
  {
    id: "marrakech",
    canonicalName: "Marrakech",
    regionId: "marrakech_safi",
    regionName: "Marrakech-Safi",
    localizedNames: { ar: "مراكش" },
    aliases: ["Marrakesh", "Marraquech", "Marrakesch", "مراكش"],
    serviceAreaStatus: "planned",
  },
  {
    id: "fes",
    canonicalName: "Fes",
    regionId: "fes_meknes",
    regionName: "Fès-Meknès",
    localizedNames: { fr: "Fès", es: "Fez", ar: "فاس" },
    aliases: ["Fès", "Fez", "فاس"],
    serviceAreaStatus: "planned",
  },
  {
    id: "meknes",
    canonicalName: "Meknes",
    regionId: "fes_meknes",
    regionName: "Fès-Meknès",
    localizedNames: { fr: "Meknès", ar: "مكناس" },
    aliases: ["Meknès", "Mequinez", "مكناس"],
    serviceAreaStatus: "waiting_list",
  },
  {
    id: "agadir",
    canonicalName: "Agadir",
    regionId: "souss_massa",
    regionName: "Souss-Massa",
    localizedNames: { ar: "أكادير" },
    aliases: ["أكادير", "اكادير"],
    serviceAreaStatus: "waiting_list",
  },
  {
    id: "oujda",
    canonicalName: "Oujda",
    regionId: "oriental",
    regionName: "Oriental",
    localizedNames: { ar: "وجدة" },
    aliases: ["وجدة"],
    serviceAreaStatus: "waiting_list",
  },
  {
    id: "nador",
    canonicalName: "Nador",
    regionId: "oriental",
    regionName: "Oriental",
    localizedNames: { ar: "الناظور" },
    aliases: ["الناظور"],
    serviceAreaStatus: "waiting_list",
  },
] as const;

const CITY_BY_ID = new Map(MOROCCAN_CITIES.map((c) => [c.id, c]));

export function findCity(id: string | undefined | null): MoroccanCity | undefined {
  return id ? CITY_BY_ID.get(id) : undefined;
}

/** Localized display name for the current locale, falling back to canonical. */
export function displayCityName(city: MoroccanCity, locale: Locale): string {
  return city.localizedNames?.[locale] ?? city.canonicalName;
}

/** Fold case, trim, and strip Latin diacritics so "Tánger" matches "Tanger". */
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/** Every searchable token for a city: canonical, localized names and aliases. */
function tokensFor(city: MoroccanCity): string[] {
  return [
    city.canonicalName,
    ...(city.aliases ?? []),
    ...Object.values(city.localizedNames ?? {}),
    city.regionName,
  ];
}

/**
 * Resolve a free-text name (any language/spelling) to a canonical city, so
 * "Tanger", "Tangier", "Tánger" and "طنجة" all map to the same record. Returns
 * undefined when nothing matches, the caller then treats it as a manual city.
 */
export function canonicalizeCity(input: string | undefined | null): MoroccanCity | undefined {
  if (!input || !input.trim()) return undefined;
  const q = fold(input);
  if (CITY_BY_ID.has(q)) return CITY_BY_ID.get(q);
  return MOROCCAN_CITIES.find((c) => c.id === q || tokensFor(c).some((t) => fold(t) === q));
}

export type CitySearchResult = MoroccanCity & { displayName: string };

/**
 * Rank cities for a search box: exact/prefix matches first, then substring, on
 * the localized name, aliases or region. An empty query returns all cities in
 * config order (active areas first) so the dropdown is useful before typing.
 */
export function searchCities(query: string, locale: Locale, limit = 8): CitySearchResult[] {
  const withDisplay = (c: MoroccanCity): CitySearchResult => ({ ...c, displayName: displayCityName(c, locale) });
  const q = fold(query);
  if (!q) {
    const order: Record<ServiceAreaStatus, number> = { active: 0, planned: 1, waiting_list: 2, unsupported: 3 };
    return [...MOROCCAN_CITIES]
      .sort((a, b) => order[a.serviceAreaStatus] - order[b.serviceAreaStatus])
      .slice(0, limit)
      .map(withDisplay);
  }
  const scored = MOROCCAN_CITIES.map((c) => {
    const tokens = tokensFor(c).map(fold);
    let score = Infinity;
    for (const t of tokens) {
      if (t === q) score = Math.min(score, 0);
      else if (t.startsWith(q)) score = Math.min(score, 1);
      else if (t.includes(q)) score = Math.min(score, 2);
    }
    return { c, score };
  })
    .filter((x) => x.score < Infinity)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
  return scored.map((x) => withDisplay(x.c));
}

/** Service-area status for an id (unknown/manual → "unsupported"). */
export function cityServiceStatus(id: string | undefined | null): ServiceAreaStatus {
  return findCity(id)?.serviceAreaStatus ?? "unsupported";
}
