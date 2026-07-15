import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import {
  EARLY_ACCESS_ENGLISH_SOCIAL_COPY,
  EARLY_ACCESS_SOCIAL_IMAGE,
  EARLY_ACCESS_SOCIAL_IMAGE_PATH,
  earlyAccessCanonicalUrl,
  earlyAccessLanguageAlternates,
  earlyAccessOpenGraphLocales,
} from "./social-metadata";

test("Early Access social image is versioned, absolute, secure, and committed", () => {
  assert.equal(EARLY_ACCESS_SOCIAL_IMAGE.url, "https://www.dartahara.com/images/social/dar-tahara-early-access-v1.jpg");
  assert.equal(EARLY_ACCESS_SOCIAL_IMAGE.secureUrl, EARLY_ACCESS_SOCIAL_IMAGE.url);
  assert.equal(EARLY_ACCESS_SOCIAL_IMAGE.type, "image/jpeg");
  assert.equal(EARLY_ACCESS_SOCIAL_IMAGE.width, 1200);
  assert.equal(EARLY_ACCESS_SOCIAL_IMAGE.height, 630);

  const asset = `public${EARLY_ACCESS_SOCIAL_IMAGE_PATH}`;
  assert.ok(existsSync(asset));
  assert.ok(statSync(asset).size > 0);
  assert.deepEqual([...readFileSync(asset).subarray(0, 3)], [0xff, 0xd8, 0xff]);
});

test("Early Access canonical URLs never include campaign or referral parameters", () => {
  assert.equal(earlyAccessCanonicalUrl("en"), "https://www.dartahara.com/en/early-access");
  assert.equal(earlyAccessCanonicalUrl("fr"), "https://www.dartahara.com/fr/early-access");
  assert.ok(!earlyAccessCanonicalUrl("en").includes("?"));
  assert.equal(earlyAccessLanguageAlternates()["x-default"], earlyAccessCanonicalUrl("en"));
});

test("Open Graph locale metadata includes translated alternatives", () => {
  const metadata = earlyAccessOpenGraphLocales("en");
  assert.equal(metadata.locale, "en_US");
  assert.ok(metadata.alternateLocale.includes("fr_FR"));
  assert.ok(metadata.alternateLocale.includes("ar_MA"));
  assert.ok(!metadata.alternateLocale.includes("en_US"));
});

test("English social copy matches the campaign brief", () => {
  assert.equal(EARLY_ACCESS_ENGLISH_SOCIAL_COPY.title, "Dar Tahara Early Access");
  assert.match(EARLY_ACCESS_ENGLISH_SOCIAL_COPY.description, /premium home cleaning/);
});
