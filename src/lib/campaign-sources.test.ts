import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCampaignSource, buildTrackedUrl, toCampaignSourceRow } from "./campaign-sources";

test("valid source normalises + defaults UTMs", () => {
  const r = validateCampaignSource({
    internalName: "Tangier owners WhatsApp",
    sourceCode: "WA_TNG_001",
    sourceChannel: "whatsapp",
  });
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.value.sourceCode, "wa_tng_001"); // lowercased
    assert.equal(r.value.utmSource, "whatsapp"); // defaulted from channel
    assert.equal(r.value.utmCampaign, "early_access_2026"); // default
    assert.equal(r.value.utmContent, "wa_tng_001"); // defaults to code
    assert.equal(r.value.costCurrency, "EUR");
  }
});

test("requires name + code", () => {
  const r = validateCampaignSource({ sourceChannel: "whatsapp" });
  assert.ok(!r.ok);
  if (!r.ok) {
    assert.equal(r.errors.internalName, "required");
    assert.equal(r.errors.sourceCode, "required");
  }
});

test("rejects invalid code + channel + cost", () => {
  const r = validateCampaignSource({
    internalName: "x", sourceCode: "bad code!", sourceChannel: "carrier-pigeon", campaignCost: -5,
  });
  assert.ok(!r.ok);
  if (!r.ok) {
    assert.equal(r.errors.sourceCode, "invalid_code");
    assert.equal(r.errors.sourceChannel, "invalid");
    assert.equal(r.errors.campaignCost, "invalid");
  }
});

test("buildTrackedUrl produces src + utm params", () => {
  const url = buildTrackedUrl(
    { sourceCode: "wa_nl_001", utmSource: "whatsapp", utmMedium: "group", utmCampaign: "early_access_2026", utmContent: "moroccans_nl" },
    { baseUrl: "https://dartahara.com", locale: "en" },
  );
  assert.ok(url.startsWith("https://dartahara.com/en/early-access?"));
  const q = new URL(url).searchParams;
  assert.equal(q.get("src"), "wa_nl_001");
  assert.equal(q.get("utm_source"), "whatsapp");
  assert.equal(q.get("utm_medium"), "group");
  assert.equal(q.get("utm_content"), "moroccans_nl");
});

test("buildTrackedUrl omits empty utm params", () => {
  const url = buildTrackedUrl({ sourceCode: "flyer_01" }, { baseUrl: "https://x.co" });
  const q = new URL(url).searchParams;
  assert.equal(q.get("src"), "flyer_01");
  assert.equal(q.get("utm_source"), null);
});

test("toCampaignSourceRow maps to snake_case + active status", () => {
  const r = validateCampaignSource({ internalName: "P", sourceCode: "p_01", campaignCost: 50 });
  assert.ok(r.ok);
  if (r.ok) {
    const row = toCampaignSourceRow(r.value);
    assert.equal(row.internal_name, "P");
    assert.equal(row.source_code, "p_01");
    assert.equal(row.campaign_cost, 50);
    assert.equal(row.status, "active");
  }
});
