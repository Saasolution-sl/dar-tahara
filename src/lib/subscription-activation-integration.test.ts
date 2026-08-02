import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("proposal acceptance requires explicit automatic-payment authorization and schedules Friday billing", () => {
  const route = readFileSync(
    join(root, "src/app/api/account/proposals/[id]/checkout/route.ts"),
    "utf8",
  );
  assert.match(route, /automaticPaymentAuthorized !== true/);
  assert.match(route, /automatic_payment_authorization_required/);
  assert.match(route, /assessment\.status !== "approved"/);
  assert.match(route, /assessment\.payment_status !== "paid"/);
  assert.match(route, /nextFridayPaymentAt\(authorizedAt\)/);
  assert.match(route, /createAuthorizedSubscriptionSchedule/);
  assert.match(route, /subscription_payment_authorizations/);
  assert.doesNotMatch(route, /createSubscriptionCheckoutSession/);
});

test("first paid subscription invoice creates the following-week service booking", () => {
  const webhook = readFileSync(
    join(root, "src/app/api/stripe/webhook/route.ts"),
    "utf8",
  );
  assert.match(webhook, /activateSubscriptionAfterFirstPayment/);
  assert.match(webhook, /if \(subscription\.activated_at\) return/);
  assert.match(webhook, /serviceWindowAfterPayment\(paidAt\)/);
  assert.match(webhook, /serviceInsertIgnoreDuplicates\("service_bookings"/);
  assert.match(webhook, /"source_invoice_id"/);
  assert.match(webhook, /event\.type === "invoice\.paid"/);
});

test("authorization and booking tables are customer-owned, read-only through RLS", () => {
  const migration = readFileSync(
    join(
      root,
      "supabase/migrations/20260802180700_subscription_payment_authorization_and_service_bookings.sql",
    ),
    "utf8",
  );
  for (const expected of [
    "create table if not exists public.subscription_payment_authorizations",
    "create table if not exists public.service_bookings",
    "automatic_payments_authorized boolean not null",
    "alter table public.subscription_payment_authorizations enable row level security",
    "alter table public.service_bookings enable row level security",
    "create policy payment_authorizations_read_own",
    "create policy service_bookings_read_own",
    "grant select on table public.subscription_payment_authorizations, public.service_bookings",
  ]) {
    assert.ok(migration.includes(expected), expected);
  }
  assert.doesNotMatch(
    migration,
    /grant\s+[^;]*\b(insert|update|delete)\b[^;]*\bto authenticated\b/i,
  );
});
