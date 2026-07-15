import { test } from "node:test";
import assert from "node:assert/strict";
import { isMarketingCampaignEnabled } from "./marketing-campaign";

test("marketing campaign switch accepts explicit enabled values", () => {
  for (const value of ["true", "TRUE", "1", "yes", "on", " on "]) {
    assert.equal(isMarketingCampaignEnabled(value), true, `${value} should enable the campaign`);
  }
});

test("marketing campaign stays off by default and for ambiguous values", () => {
  for (const value of [undefined, "", "false", "0", "enabled", "off"]) {
    assert.equal(isMarketingCampaignEnabled(value), false, `${String(value)} should not enable the campaign`);
  }
});
