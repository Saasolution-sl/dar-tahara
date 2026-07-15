import { test } from "node:test";
import assert from "node:assert/strict";
import { validateStep, validateAll, isValidEmail, type EarlyAccessPayload } from "./schema";
import { toE164, isPlausibleE164 } from "./phone";
import { parseAttribution, toLeadAttributionColumns } from "./attribution";
import { generateReferralCode, isValidReferralCodeFormat, canCreditReferral } from "./referral";
import { screenSubmission, isDisposableEmail, MIN_FORM_ELAPSED_MS } from "./antispam";
import { buildLeadRow, buildPropertyRow, buildConsentRows, propertySizeRange } from "./mappers";

function full(): EarlyAccessPayload {
  return {
    firstName: "Sam", lastName: "Tahiri", email: "sam@example.com",
    preferredContactMethod: "whatsapp", mobileNumber: "0612345678", countryCallingCode: "+212",
    residenceCity: "Tangier",
    billingRecipientType: "private", billingAddressLine1: "1 Rue X", billingCity: "Brussels", billingCountry: "BE",
    propertyAddressLine1: "5 Rue Y", propertyCity: "Tangier", authorizedBySubmitter: true,
    serviceTypes: ["deep_cleaning"], accessMethod: "digital_lock",
    confirmAccurate: true, confirmAuthorized: true, acceptPrivacy: true, acceptOperationalComms: true,
  };
}

// ── validation ─────────────────────────────────────────────────────────────────
test("contact step requires name + valid email", () => {
  assert.deepEqual(validateStep("contact", { ...full(), email: "nope" }), { email: "invalid_email" });
  assert.deepEqual(validateStep("contact", { ...full(), firstName: " " }), { firstName: "required" });
});

test("contact step requires a phone unless method is email", () => {
  const noPhone = { ...full(), mobileNumber: "", whatsappNumber: "" };
  assert.equal(validateStep("contact", noPhone).mobileNumber, "phone_required");
  assert.deepEqual(validateStep("contact", { ...noPhone, preferredContactMethod: "email" }), {});
});

test("contact step accepts listed and custom Moroccan cities but rejects the Other placeholder", () => {
  assert.deepEqual(validateStep("contact", { ...full(), residenceCity: "Tetouan" }), {});
  assert.deepEqual(validateStep("contact", { ...full(), residenceCity: "Chefchaouen" }), {});
  assert.equal(validateStep("contact", { ...full(), residenceCity: "__other__" }).residenceCity, "invalid");
  assert.equal(validateStep("contact", { ...full(), residenceCity: "x".repeat(121) }).residenceCity, "invalid");
});

test("property step requires authorization confirmation", () => {
  assert.equal(validateStep("property_address", { ...full(), authorizedBySubmitter: false }).authorizedBySubmitter,
    "authorization_required");
});

test("property address not required when copying billing", () => {
  const p = { ...full(), useBillingAsProperty: true, propertyAddressLine1: "", propertyCity: "" };
  assert.deepEqual(validateStep("property_address", p), {});
});

test("services step requires at least one service", () => {
  assert.equal(validateStep("services", { ...full(), serviceTypes: [] }).serviceTypes, "select_one");
});

test("physical key access requires acknowledgement", () => {
  const p = { ...full(), accessMethod: "physical_key", physicalKeyTermsAcknowledged: false };
  assert.equal(validateStep("access", p).physicalKeyTermsAcknowledged, "acknowledgement_required");
});

test("review requires the four mandatory confirmations, not marketing", () => {
  assert.deepEqual(validateStep("review", full()), {}); // marketingConsent absent → still ok
  assert.equal(validateStep("review", { ...full(), acceptPrivacy: false }).acceptPrivacy, "required");
});

test("validateAll passes for a complete payload", () => {
  assert.equal(validateAll(full()).ok, true);
});

test("isValidEmail basics", () => {
  assert.ok(isValidEmail("a@b.co"));
  assert.ok(!isValidEmail("missing@dot"));
});

// ── phone ────────────────────────────────────────────────────────────────────
test("toE164 combines calling code + national number, dropping trunk zero", () => {
  assert.equal(toE164("0612345678", "+212"), "+212612345678");
  assert.equal(toE164("06 12 34 56 78", "+212"), "+212612345678");
});
test("toE164 passes through already-international and 00 prefix", () => {
  assert.equal(toE164("+212612345678"), "+212612345678");
  assert.equal(toE164("00212612345678"), "+212612345678");
});
test("toE164 returns null when it cannot be trusted", () => {
  assert.equal(toE164("12345", null), null);
  assert.equal(toE164("", "+212"), null);
});
test("isPlausibleE164", () => {
  assert.ok(isPlausibleE164("+212612345678"));
  assert.ok(!isPlausibleE164("212612345678"));
  assert.ok(!isPlausibleE164("+123"));
});

// ── attribution ────────────────────────────────────────────────────────────────
test("parseAttribution reads src + utm and sanitises", () => {
  const a = parseAttribution(new URLSearchParams("src=wa_tng_001&utm_source=whatsapp&utm_medium=group"));
  assert.equal(a.sourceCode, "wa_tng_001");
  assert.equal(a.utmSource, "whatsapp");
  assert.equal(a.utmMedium, "group");
});
test("first-touch preserved separately from last-touch", () => {
  const cols = toLeadAttributionColumns({ utmSource: "whatsapp" }, { utmSource: "instagram" });
  assert.equal(cols.first_utm_source, "whatsapp");
  assert.equal(cols.last_utm_source, "instagram");
});
test("last-touch falls back to first when only first is known", () => {
  const cols = toLeadAttributionColumns({ utmSource: "whatsapp" }, undefined);
  assert.equal(cols.last_utm_source, "whatsapp");
});

// ── referral ─────────────────────────────────────────────────────────────────
test("generateReferralCode is 8 chars in the safe alphabet", () => {
  const code = generateReferralCode();
  assert.match(code, /^[A-HJ-NP-Z2-9]{8}$/);
  assert.ok(isValidReferralCodeFormat(code));
});
test("referral code avoids ambiguous characters", () => {
  // Deterministic RNG that would map to index 0 (A) — never 0/O/1/I.
  const code = generateReferralCode(() => new Uint8Array(8));
  assert.ok(!/[01OI]/.test(code));
});
test("canCreditReferral rejects self, mismatch and loops", () => {
  assert.equal(canCreditReferral({ referrerLeadId: "a", referredLeadId: "a", referrerCode: "X", referredSignupCode: "X" }).reason, "self_referral");
  assert.equal(canCreditReferral({ referrerLeadId: "a", referredLeadId: "b", referrerCode: "X", referredSignupCode: "Y" }).reason, "code_mismatch");
  assert.equal(canCreditReferral({ referrerLeadId: "a", referredLeadId: "b", referrerCode: "X", referredSignupCode: "X", referrerReferredBy: "X" }).reason, "referral_loop");
  assert.equal(canCreditReferral({ referrerLeadId: "a", referredLeadId: "b", referrerCode: "X", referredSignupCode: "X" }).ok, true);
});

// ── antispam ─────────────────────────────────────────────────────────────────
test("honeypot content flags spam", () => {
  assert.deepEqual(screenSubmission({ honeypot: "http://spam" }), { spam: true, reason: "honeypot" });
});
test("too-fast submission flagged, missing timer allowed", () => {
  assert.equal(screenSubmission({ elapsedMs: 500 }).spam, true);
  assert.equal(screenSubmission({ elapsedMs: MIN_FORM_ELAPSED_MS + 1 }).spam, false);
  assert.equal(screenSubmission({}).spam, false); // no timer → not spam
});
test("isDisposableEmail catches known throwaway domains", () => {
  assert.ok(isDisposableEmail("x@mailinator.com"));
  assert.ok(!isDisposableEmail("x@gmail.com"));
});

// ── mappers ────────────────────────────────────────────────────────────────────
test("buildLeadRow normalises email + phones + status pending", () => {
  const row = buildLeadRow({ ...full(), email: "SAM@Example.COM" }, { first: { utmSource: "whatsapp" } });
  assert.equal(row.normalized_email, "sam@example.com");
  assert.equal(row.mobile_phone, "+212612345678");
  assert.equal(row.whatsapp_phone, "+212612345678"); // same-as-mobile default path
  assert.equal(row.status, "pending");
  assert.equal(row.residence_city, "Tangier");
  assert.equal(row.first_utm_source, "whatsapp");
});
test("buildPropertyRow copies billing only when Morocco + flag set", () => {
  const copyMA = buildPropertyRow("L", { ...full(), useBillingAsProperty: true, billingCountry: "MA", billingCity: "Rabat", propertyCity: "" });
  assert.equal(copyMA.city, "Rabat");
  const noCopyBE = buildPropertyRow("L", { ...full(), useBillingAsProperty: true, billingCountry: "BE", billingCity: "Brussels", propertyCity: "Tangier" });
  assert.equal(noCopyBE.city, "Tangier"); // billing outside MA → not copied
});
test("buildConsentRows separates operational from marketing", () => {
  const noMarketing = buildConsentRows("L", full(), {});
  assert.ok(!noMarketing.some((r) => r.consent_type === "marketing"));
  const withMarketing = buildConsentRows("L", { ...full(), marketingConsent: true }, {});
  assert.ok(withMarketing.some((r) => r.consent_type === "marketing" && r.granted === true));
});
test("propertySizeRange bands", () => {
  assert.equal(propertySizeRange(45), "under_60");
  assert.equal(propertySizeRange(120), "100_150");
  assert.equal(propertySizeRange(400), "over_250");
  assert.equal(propertySizeRange(undefined), undefined);
});
