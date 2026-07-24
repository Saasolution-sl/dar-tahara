import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { locales } from "@/i18n/config";
import { SERVICE_POLICY, SERVICE_POLICY_COPY } from "./service-policy";

test("owner-approved service policy has localized customer copy in all supported languages", () => {
  assert.equal(Object.keys(SERVICE_POLICY_COPY).length, locales.length);
  for (const locale of locales) {
    const copy = SERVICE_POLICY_COPY[locale];
    assert.match(copy.articleContent, /48|٤٨/);
    assert.match(copy.articleContent, /14|١٤/);
    assert.match(copy.articleContent, /100|١٠٠/);
    assert.match(copy.articleContent, /portal|portaal|portail|بوابة/iu);
    assert.equal(copy.termsScheduling.length, 4);
    assert.equal(copy.termsSubscription.length, 4);
  }
});

test("support identity, hours and response target are canonical", () => {
  assert.equal(SERVICE_POLICY.supportName, "Dar Tahara Support");
  assert.deepEqual(SERVICE_POLICY.supportChannels, ["whatsapp", "phone", "email"]);
  assert.equal(SERVICE_POLICY.supportHours, "09:00–21:00");
  assert.equal(SERVICE_POLICY.supportTimeZone, "GMT+01:00");
  assert.equal(SERVICE_POLICY.supportResponseWorkingHours, 24);
  for (const locale of locales) {
    assert.match(SERVICE_POLICY_COPY[locale].termsSupport, /Dar Tahara Support/);
    assert.match(SERVICE_POLICY_COPY[locale].termsSupport, /24/);
    assert.match(SERVICE_POLICY_COPY[locale].termsSupport, /GMT\+01:00/);
  }
});

test("homepage and renewal copy no longer advertise subscription pauses", () => {
  const obsoleteClaims = [
    "pause while you travel",
    "pauzeer terwijl u reist",
    "suspendez pendant vos voyages",
    "أوقِفها أثناء سفرك",
    "pausa mientras viajas",
    "pausieren Sie während Ihrer Reisen",
    "pause enquanto viaja",
  ];
  for (const locale of locales) {
    const dictionary = readFileSync(join(process.cwd(), `src/i18n/dictionaries/${locale}.ts`), "utf8");
    assert.match(dictionary, /Dar Tahara Support/, locale);
    assert.doesNotMatch(dictionary, new RegExp(obsoleteClaims.join("|"), "iu"), locale);
  }
  const emailCopy = readFileSync(join(process.cwd(), "src/lib/transactional-email.ts"), "utf8");
  assert.doesNotMatch(emailCopy, /unless paused|tenzij u vooraf pauzeert|sauf suspension|ما لم يتم إيقافه|salvo pausa|vorher pausiert/iu);
});
