import "server-only";
import { headers } from "next/headers";
import { serviceInsert, serviceSelect, isServiceRoleConfigured } from "@/lib/supabase-rpc";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { hashIp } from "./request-meta";
import { parseAttribution } from "./attribution";
import { buildPageViewRow, isLikelyBot, type PageViewStat } from "./page-views";

const NOOP = async () => {};

/**
 * Prepare one view of the early-access page for recording. Server-side and
 * cookieless: the visitor's browser is never asked to store anything, so this
 * needs no consent banner and cannot be blocked by an ad blocker.
 *
 * Split into prepare/commit because of a hard Next constraint: `headers()`
 * CANNOT be called inside an `after()` callback, it throws. So the request is
 * inspected here, during render, and only the returned writer is deferred:
 *
 *     after(await prepareEarlyAccessPageView(locale, query));
 *
 * FAIL-OPEN, ALWAYS. A counter is never worth a broken landing page, so every
 * failure path, Supabase down, service role unset, malformed params, resolves
 * to a no-op. Failures ARE logged rather than swallowed: a counter that cannot
 * report its own breakage is indistinguishable from a page nobody visited.
 */
export async function prepareEarlyAccessPageView(
  locale: string,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<() => Promise<void>> {
  try {
    if (!isServiceRoleConfigured()) return NOOP;

    const h = await headers();
    if (isLikelyBot(h.get("user-agent"))) return NOOP;
    // Next prefetches the page on link hover; those are not views.
    if (h.get("next-router-prefetch") === "1" || h.get("purpose") === "prefetch") return NOOP;

    // Reuse the same parser (and the same sanitizing) the form attribution uses,
    // so a view and a submission agree on what a source code is.
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      const first = Array.isArray(v) ? v[0] : v;
      if (typeof first === "string") params.set(k, first);
    }
    const attribution = parseAttribution(params);
    const ip = clientIpFromHeaders(h);

    // Everything below runs after the response is flushed, the visitor waits on
    // neither the hash nor the round-trip.
    return async () => {
      try {
        await serviceInsert(
          "early_access_page_views",
          buildPageViewRow({ locale, attribution, ipHash: await hashIp(ip) }),
        );
      } catch (e) {
        console.error("[early-access] page-view write failed:", String(e).slice(0, 200));
      }
    };
  } catch (e) {
    console.error("[early-access] page-view capture failed:", String(e).slice(0, 200));
    return NOOP;
  }
}

/**
 * Per-source view aggregates for the admin campaign-links utility. Returns an
 * empty list rather than throwing so the sources table still renders (without
 * counts) if the stats view is missing, e.g. before this migration is applied.
 */
export async function fetchPageViewStats(): Promise<PageViewStat[]> {
  try {
    if (!isServiceRoleConfigured()) return [];
    const rows = await serviceSelect<PageViewStat[]>(
      "early_access_page_view_stats?select=source_code,views,unique_visitors,first_view_at,last_view_at",
    );
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}
