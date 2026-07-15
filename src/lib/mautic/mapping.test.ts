import { test } from "node:test";
import assert from "node:assert/strict";
import { mapLeadToMauticFields, tagsForLead } from "./mapping";
import type { LeadForSync } from "./types";

const base: LeadForSync = {
  id: "11111111-1111-1111-1111-111111111111",
  normalizedEmail: "sam@example.com",
  email: "Sam@Example.com",
  firstName: "Sam",
  lastName: "Tahiri",
};

test("maps core identity to Mautic built-in aliases", () => {
  const f = mapLeadToMauticFields({ ...base, residenceCity: "Al Hoceima" });
  assert.equal(f.firstname, "Sam");
  assert.equal(f.lastname, "Tahiri");
  assert.equal(f.email, "sam@example.com"); // normalized preferred over raw
  assert.equal(f.supabase_lead_id, base.id);
  assert.equal(f.residence_city, "Al Hoceima");
});

test("omits null/undefined/blank instead of overwriting with empty", () => {
  const f = mapLeadToMauticFields({ ...base, whatsappPhone: null, cleaningCity: "   " });
  assert.ok(!("whatsapp_phone" in f));
  assert.ok(!("cleaning_city" in f));
});

test("multiselect services are joined with a pipe", () => {
  const f = mapLeadToMauticFields({
    ...base,
    desiredServices: ["deep_cleaning", "window_cleaning"],
  });
  assert.equal(f.desired_services, "deep_cleaning|window_cleaning");
});

test("booleans map even when false; numbers preserved", () => {
  const f = mapLeadToMauticFields({
    ...base,
    hasDigitalLock: false,
    emailVerified: false,
    verifiedReferralCount: 0,
  });
  assert.equal(f.has_digital_lock, false);
  assert.equal(f.email_verified, false);
  assert.equal(f.verified_referral_count, 0);
});

test("first-touch and last-touch attribution map to separate aliases", () => {
  const f = mapLeadToMauticFields({
    ...base,
    firstUtmSource: "whatsapp",
    firstUtmCampaign: "early_access_2026",
    lastUtmSource: "instagram",
  });
  assert.equal(f.first_utm_source, "whatsapp");
  assert.equal(f.first_utm_campaign, "early_access_2026");
  assert.equal(f.last_utm_source, "instagram");
});

test("tagsForLead always includes campaign tags + verification state", () => {
  const tags = tagsForLead(base);
  assert.ok(tags.includes("dar-tahara"));
  assert.ok(tags.includes("early-access"));
  assert.ok(tags.includes("early-access-2026"));
  assert.ok(tags.includes("unverified-lead"));
  assert.ok(!tags.includes("verified-lead"));
});

test("tagsForLead reflects verified + facet tags, de-duplicated", () => {
  const tags = tagsForLead({
    ...base,
    emailVerified: true,
    status: "qualified",
    firstUtmSource: "WhatsApp",
    propertyType: "villa",
    desiredFrequency: "weekly",
    accessMethod: "physical_key",
  });
  assert.ok(tags.includes("verified-lead"));
  assert.ok(tags.includes("qualified-lead"));
  assert.ok(tags.includes("source-whatsapp")); // case-insensitive
  assert.ok(tags.includes("property-villa"));
  assert.ok(tags.includes("frequency-weekly"));
  assert.ok(tags.includes("access-physical-key"));
  assert.equal(new Set(tags).size, tags.length); // no duplicates
});
