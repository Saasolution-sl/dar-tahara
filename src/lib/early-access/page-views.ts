/**
 * Cookieless page-view counting for the early-access page, pure domain logic,
 * no I/O (the write lives in ./page-view-recorder).
 *
 * The counter is deliberately consent-free: it records the campaign params that
 * were already in the URL plus a salted IP hash, and nothing else. No cookie is
 * set and no identifier is stored, so it is lawful to run before a cookie banner
 * is answered, and it keeps working for the majority who never answer one.
 */

import type { Attribution } from "./attribution";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

/** The row shape written to public.early_access_page_views. */
export type PageViewRow = {
  locale: Locale;
  source_code: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  ip_hash: string | null;
};

/** Per-source aggregate as returned by early_access_page_view_stats. */
export type PageViewStat = {
  source_code: string | null;
  views: number;
  unique_visitors: number;
  first_view_at: string | null;
  last_view_at: string | null;
};

/**
 * Crawlers, link unfurlers and uptime checks would otherwise inflate every
 * count, a single WhatsApp share can fan out to a dozen preview fetches. This
 * is a coarse UA screen, not bot detection: it costs nothing, needs no cookie,
 * and errs toward counting (an unmatched bot is a rounding error; a wrongly
 * dropped human is a lost signal).
 */
const BOT_UA = /bot|crawl|spider|slurp|preview|fetch|monitor|curl|wget|headless|lighthouse|facebookexternalhit|whatsapp|telegram|twitterbot|linkedinbot|discord|embedly|python-requests|axios|go-http|okhttp/i;

export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.trim() === "") return true; // no UA at all → not a browser
  return BOT_UA.test(userAgent);
}

/** Values are already sanitized by parseAttribution; normalize empties to null. */
function orNull(v: string | undefined): string | null {
  const s = v?.trim();
  return s ? s : null;
}

/** Build the insert row. Everything not on this list is intentionally dropped. */
export function buildPageViewRow(input: {
  locale: string;
  attribution: Attribution;
  ipHash: string | null;
}): PageViewRow {
  const locale = (locales as readonly string[]).includes(input.locale)
    ? (input.locale as Locale)
    : defaultLocale;
  const a = input.attribution;
  return {
    locale,
    source_code: orNull(a.sourceCode),
    utm_source: orNull(a.utmSource),
    utm_medium: orNull(a.utmMedium),
    utm_campaign: orNull(a.utmCampaign),
    utm_content: orNull(a.utmContent),
    utm_term: orNull(a.utmTerm),
    ip_hash: input.ipHash,
  };
}

/**
 * Index the aggregate rows by source code so the admin list can attach counts in
 * O(1) per source. Rows with no source_code (direct/untagged traffic) are folded
 * into the `untagged` bucket rather than dropped, otherwise the totals shown to
 * staff would silently exclude the largest segment.
 */
export function indexStatsBySource(stats: PageViewStat[]): {
  bySource: Map<string, PageViewStat>;
  untagged: PageViewStat | null;
  totalViews: number;
} {
  const bySource = new Map<string, PageViewStat>();
  let untagged: PageViewStat | null = null;
  let totalViews = 0;
  for (const s of stats) {
    totalViews += Number(s.views) || 0;
    if (s.source_code) bySource.set(s.source_code, s);
    else untagged = s;
  }
  return { bySource, untagged, totalViews };
}
