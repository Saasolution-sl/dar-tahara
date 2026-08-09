import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260809120000_early_access_conversion_funnel.sql"),
  "utf8",
);

test("signup sessions allow multiple attempts for the same email", () => {
  assert.match(migration, /create index[^;]+\(normalized_email\)/s);
  assert.doesNotMatch(migration, /create unique index[^;]+\(normalized_email\)/s);
});

test("browser roles cannot directly read autosaved PII or funnel events", () => {
  assert.match(migration, /force row level security/);
  assert.match(migration, /revoke all on table public\.%I from anon/);
  assert.match(migration, /revoke all on table public\.%I from authenticated/);
});

test("event idempotency and reminder claims prevent duplicate work", () => {
  assert.match(migration, /unique index[^;]+early_access_funnel_events_idempotency_key/s);
  assert.match(migration, /reminder_count smallint[^;]+between 0 and 2/s);
  assert.match(migration, /reminder_claimed_at timestamptz/);
  assert.match(migration, /client_token_hash text not null unique/);
});

test("partial PII retention has a durable purge marker", () => {
  assert.match(migration, /pii_purged_at timestamptz/);
});
