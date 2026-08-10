import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { OTHER_CITY_ID } from "@/lib/geo/moroccan-cities";
import { EARLY_ACCESS_CONSENT_TYPES, validateEarlyAccessLead } from "./lead-schema";

const valid = {
  firstName: " Samira ",
  email: " SAMIRA@example.com ",
  cityId: "tetouan",
  marketingConsent: true,
};

test("minimal Early Access accepts name, normalized email, canonical city and consent", () => {
  const result = validateEarlyAccessLead(valid);
  assert.equal(result.ok, true);
  assert.deepEqual(result.normalized, {
    firstName: "Samira",
    email: "samira@example.com",
    cityId: "tetouan",
    city: "Tetouan",
  });
});

test("minimal Early Access rejects invalid email and missing required consent", () => {
  const result = validateEarlyAccessLead({ ...valid, email: "invalid", marketingConsent: false });
  assert.equal(result.ok, false);
  assert.equal(result.errors.email, "invalid_email");
  assert.equal(result.errors.marketingConsent, "consent_required");
});

test("minimal Early Access rejects free-text or unknown cities", () => {
  const result = validateEarlyAccessLead({ ...valid, cityId: "My made up city" });
  assert.equal(result.ok, false);
  assert.equal(result.errors.cityId, "required");
});

test("minimal Early Access accepts Other with a trimmed manual city", () => {
  const result = validateEarlyAccessLead({ ...valid, cityId: OTHER_CITY_ID, manualCity: "  Ouezzane  " });
  assert.equal(result.ok, true);
  assert.deepEqual(result.normalized, {
    firstName: "Samira",
    email: "samira@example.com",
    cityId: OTHER_CITY_ID,
    city: "Ouezzane",
  });
});

test("minimal Early Access requires a city name when Other is selected", () => {
  const result = validateEarlyAccessLead({ ...valid, cityId: OTHER_CITY_ID, manualCity: "   " });
  assert.equal(result.ok, false);
  assert.equal(result.errors.manualCity, "required");
});

test("funnel migration preserves legacy data and adds explicit conversion phases", () => {
  const sql = readFileSync(join(process.cwd(), "supabase/migrations/20260810101033_simplify_early_access_funnel.sql"), "utf8");
  assert.match(sql, /alter column last_name drop not null/i);
  assert.match(sql, /early_access_registered_at/i);
  assert.match(sql, /onboarding_started_at/i);
  assert.match(sql, /onboarding_completed_at/i);
  assert.match(sql, /onboarding_reminder/i);
  assert.doesNotMatch(sql, /drop table|truncate/i);
});

test("lead capture is one atomic database call, not three writes", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/20260810214500_atomic_early_access_lead.sql"),
    "utf8",
  );

  // A single function means a single transaction: the lead, its consents and
  // its verification token either all land or none do. The 2026-08-10 outage
  // stored leads whose consent insert had failed, because these were three
  // separate PostgREST requests.
  assert.match(sql, /create or replace function public\.persist_early_access_lead/i);
  assert.match(sql, /insert into public\.marketing_leads/i);
  assert.match(sql, /insert into public\.lead_consents/i);
  assert.match(sql, /insert into public\.email_verification_tokens/i);

  // SECURITY DEFINER without a pinned search_path is an escalation risk.
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = ''/i);

  // Server-side only: nothing reachable with the publishable key may write leads.
  assert.match(sql, /revoke all on function public\.persist_early_access_lead[\s\S]*?from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.persist_early_access_lead[\s\S]*?to service_role/i);

  assert.doesNotMatch(sql, /drop table|truncate/i);
});

test("both collected consents are recorded, not just marketing", () => {
  // The displayed wording covers reminders too, so dropping either one would
  // silently under-record what the visitor actually agreed to.
  assert.deepEqual([...EARLY_ACCESS_CONSENT_TYPES], ["marketing", "onboarding_reminder"]);
});
