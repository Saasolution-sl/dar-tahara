import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { isAccountComplete } from "./account-completion";

test("account completion requires Stripe customer and verified payment evidence", () => {
  const complete = {
    stripeCustomerId: "cus_123",
    paymentMethodReadyAt: "2026-07-30T18:00:00.000Z",
    accountCompletedAt: "2026-07-30T18:00:00.000Z",
  };
  assert.equal(isAccountComplete(complete), true);
  assert.equal(
    isAccountComplete({ ...complete, stripeCustomerId: null }),
    false,
  );
  assert.equal(
    isAccountComplete({ ...complete, paymentMethodReadyAt: null }),
    false,
  );
  assert.equal(
    isAccountComplete({ ...complete, accountCompletedAt: null }),
    false,
  );
});

test("migration makes payment details a database account-completion invariant", () => {
  const migrations = path.join(process.cwd(), "supabase", "migrations");
  const migration = readFileSync(
    path.join(
      migrations,
      "20260730201904_require_payment_method_for_account_completion.sql",
    ),
    "utf8",
  );
  assert.match(migration, /payment_method_ready_at timestamptz/i);
  assert.match(migration, /account_completed_at timestamptz/i);
  assert.match(
    migration,
    /customers_completed_account_requires_payment_method/i,
  );
  assert.match(migration, /customers_sync_account_completion/i);
  assert.match(migration, /stripe_payment_method_id is not null/i);
  assert.doesNotMatch(
    migration,
    /grant update[^;]*account_completed_at[^;]*to authenticated/i,
  );
});

test("only Stripe-verified reusable payment methods mark an account ready", () => {
  const webhook = readFileSync(
    path.join(
      process.cwd(),
      "src",
      "app",
      "api",
      "stripe",
      "webhook",
      "route.ts",
    ),
    "utf8",
  );
  assert.match(webhook, /retrieveSetupIntent\(session\.setup_intent\)/);
  assert.match(webhook, /setupIntent\.status !== "succeeded"/);
  assert.match(
    webhook,
    /setupIntent\.customer !== session\.customer/,
  );
  assert.match(webhook, /!setupIntent\.payment_method/);
  assert.match(webhook, /payment_method_ready_at: completedAt/);
  assert.match(
    webhook,
    /paymentMethodId[\s\S]*payment_method_ready_at: new Date\(\)\.toISOString\(\)/,
  );
});
