import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPageViewRow, isLikelyBot, indexStatsBySource, type PageViewStat } from "./page-views";
import { parseAttribution } from "./attribution";

function stat(p: Partial<PageViewStat>): PageViewStat {
  return { source_code: null, views: 0, unique_visitors: 0, first_view_at: null, last_view_at: null, ...p };
}

// ── row building ───────────────────────────────────────────────────────────────
test("buildPageViewRow keeps only locale, campaign params and the IP hash", () => {
  const row = buildPageViewRow({
    locale: "fr",
    attribution: parseAttribution(new URLSearchParams("src=wa_tng_001&utm_source=whatsapp&utm_medium=group")),
    ipHash: "abc123",
  });
  assert.deepEqual(row, {
    locale: "fr",
    source_code: "wa_tng_001",
    utm_source: "whatsapp",
    utm_medium: "group",
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    ip_hash: "abc123",
  });
  // The row must never grow a field that could identify a person.
  assert.deepEqual(
    Object.keys(row).filter((k) => /ip$|ua|agent|referr|cookie|email|session/i.test(k)),
    [],
  );
});

test("buildPageViewRow falls back to the default locale for an unknown one", () => {
  const row = buildPageViewRow({ locale: "klingon", attribution: {}, ipHash: null });
  assert.equal(row.locale, "en");
});

test("buildPageViewRow tolerates a view with no attribution and no IP", () => {
  const row = buildPageViewRow({ locale: "en", attribution: {}, ipHash: null });
  assert.equal(row.source_code, null);
  assert.equal(row.ip_hash, null);
});

test("buildPageViewRow normalizes blank params to null rather than empty strings", () => {
  const row = buildPageViewRow({ locale: "en", attribution: { sourceCode: "   " }, ipHash: null });
  assert.equal(row.source_code, null);
});

// ── bot screening ──────────────────────────────────────────────────────────────
test("isLikelyBot drops crawlers, unfurlers and empty user agents", () => {
  assert.equal(isLikelyBot("Googlebot/2.1 (+http://www.google.com/bot.html)"), true);
  assert.equal(isLikelyBot("WhatsApp/2.23"), true);
  assert.equal(isLikelyBot("facebookexternalhit/1.1"), true);
  assert.equal(isLikelyBot("curl/8.4.0"), true);
  assert.equal(isLikelyBot(""), true);
  assert.equal(isLikelyBot(null), true);
});

test("isLikelyBot keeps real browsers", () => {
  assert.equal(isLikelyBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_2) AppleWebKit/605.1.15 Safari/604.1"), false);
  assert.equal(isLikelyBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0 Safari/537.36"), false);
});

// ── aggregation ────────────────────────────────────────────────────────────────
test("indexStatsBySource keys tagged sources and separates untagged traffic", () => {
  const { bySource, untagged, totalViews } = indexStatsBySource([
    stat({ source_code: "wa_tng_001", views: 40, unique_visitors: 31 }),
    stat({ source_code: "ig_bio", views: 12, unique_visitors: 12 }),
    stat({ source_code: null, views: 7, unique_visitors: 5 }),
  ]);
  assert.equal(bySource.get("wa_tng_001")?.views, 40);
  assert.equal(bySource.get("ig_bio")?.unique_visitors, 12);
  assert.equal(bySource.has(""), false);
  assert.equal(untagged?.views, 7);
  // Untagged traffic counts toward the total, staff should see the real number.
  assert.equal(totalViews, 59);
});

test("indexStatsBySource returns empty aggregates when there are no views yet", () => {
  const { bySource, untagged, totalViews } = indexStatsBySource([]);
  assert.equal(bySource.size, 0);
  assert.equal(untagged, null);
  assert.equal(totalViews, 0);
});
