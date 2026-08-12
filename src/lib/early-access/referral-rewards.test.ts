import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_REFERRALS,
  buildProgressBarHtml,
  buildReferralLink,
  computeReferralRewards,
  mapRewardsToMauticFields,
} from "./referral-rewards";

const FILLED = "#b68235";
const EMPTY = "#eae7e7";

function countCells(html: string, color: string): number {
  return html.split(`background-color:${color};`).length - 1;
}

test("each of the five email states gets the values its copy hard-codes", () => {
  // These are the exact numbers printed in the designer's five HTML files, so a
  // change to the reward model that desyncs them fails here rather than in an inbox.
  const cases = [
    { count: 0, pct: 0, saving: 0, nextPct: 2.5 },
    { count: 3, pct: 7.5, saving: 15, nextPct: 10 },
    { count: 5, pct: 12.5, saving: 25, nextPct: 15 },
    { count: 9, pct: 22.5, saving: 45, nextPct: 25 },
    { count: 10, pct: 25, saving: 50, nextPct: 25 },
  ];
  for (const c of cases) {
    const r = computeReferralRewards(c.count);
    assert.equal(r.pct, c.pct, `pct for ${c.count}`);
    assert.equal(r.saving, c.saving, `saving for ${c.count}`);
    assert.equal(r.nextPct, c.nextPct, `nextPct for ${c.count}`);
  }
});

test("rewards saturate at the maximum instead of promising more than 25%", () => {
  // An over-credited contact must never be shown 30% off.
  const r = computeReferralRewards(14);
  assert.equal(r.count, MAX_REFERRALS);
  assert.equal(r.pct, 25);
  assert.equal(r.saving, 50);
  assert.equal(r.nextPct, 25, "at maximum there is no further tier to tease");
});

test("corrupt counts floor at zero rather than producing negative discounts", () => {
  for (const bad of [-3, Number.NaN, Number.POSITIVE_INFINITY * 0]) {
    const r = computeReferralRewards(bad);
    assert.equal(r.count, 0);
    assert.equal(r.pct, 0);
    assert.equal(r.saving, 0);
  }
});

test("progress bar always has exactly ten cells, filled to the count", () => {
  for (let n = 0; n <= MAX_REFERRALS; n++) {
    const html = buildProgressBarHtml(n);
    assert.equal(countCells(html, FILLED), n, `${n} filled`);
    assert.equal(countCells(html, EMPTY), MAX_REFERRALS - n, `${n} empty`);
    assert.equal(html.split("<td").length - 1, MAX_REFERRALS, "cell count");
  }
});

test("progress bar markup matches the designer's static cells byte-for-byte", () => {
  // email-03-halfway.html hard-codes five filled cells; the generated bar for a
  // count of 5 must be identical or the two states won't line up in the inbox.
  const cell = (c: string) =>
    `<td style="height:8px;background-color:${c};border-left:2px solid #ffffff"></td>`;
  const expected = cell(FILLED).repeat(5) + cell(EMPTY).repeat(5);
  assert.equal(buildProgressBarHtml(5), expected);
});

test("progress bar is far longer than a varchar(191) Mautic text field", () => {
  // Documents why the field is provisioned as `html` (LONGTEXT): a `text` field
  // would truncate this mid-tag and emit broken markup into the email.
  assert.ok(
    buildProgressBarHtml(10).length > 191,
    "bar must exceed 191 chars, proving the html field type is required",
  );
});

test("referral link is built in the contact's own language", () => {
  assert.equal(
    buildReferralLink({
      baseUrl: "https://www.dartahara.com",
      referralCode: "ABCD2345",
      preferredLanguage: "fr",
    }),
    "https://www.dartahara.com/fr/early-access?ref=ABCD2345",
  );
});

test("referral link falls back to English for missing or unknown languages", () => {
  for (const lang of [null, undefined, "", "klingon"]) {
    assert.equal(
      buildReferralLink({
        baseUrl: "https://www.dartahara.com",
        referralCode: "ABCD2345",
        preferredLanguage: lang,
      }),
      "https://www.dartahara.com/en/early-access?ref=ABCD2345",
    );
  }
});

test("referral link tolerates a trailing slash and escapes the code", () => {
  assert.equal(
    buildReferralLink({
      baseUrl: "https://www.dartahara.com/",
      referralCode: "A B&C",
      preferredLanguage: "en",
    }),
    "https://www.dartahara.com/en/early-access?ref=A%20B%26C",
  );
});

test("field payload uses the live aliases, not the handoff's proposed ones", () => {
  const fields = mapRewardsToMauticFields({
    rewards: computeReferralRewards(3),
    referralLink: "https://www.dartahara.com/en/early-access?ref=ABCD2345",
  });
  assert.equal(fields.verified_referral_count, 3, "reuses the existing counter");
  assert.ok(!("referral_count" in fields), "must not write a duplicate counter");
  assert.ok(
    !("referral_progress_bar_html" in fields),
    "26-char alias would be truncated by Mautic",
  );
  assert.ok("referral_progress_html" in fields);
  // Every alias must survive Mautic's 25-character truncation.
  for (const alias of Object.keys(fields)) {
    assert.ok(alias.length <= 25, `${alias} is ${alias.length} chars, max 25`);
  }
});

test("a missing referral link never blanks the one Mautic already holds", () => {
  const fields = mapRewardsToMauticFields({
    rewards: computeReferralRewards(2),
    referralLink: null,
  });
  assert.ok(!("referral_link" in fields));
});
