import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

const root = process.cwd();

test("public signup keeps email confirmation and social providers configured", () => {
  const config = readFileSync(join(root, "supabase/config.toml"), "utf8");
  assert.match(config, /\[auth\.email\][\s\S]*enable_confirmations = true/);
  assert.match(config, /\[auth\.external\.google\]/);
  assert.match(config, /\[auth\.external\.apple\]/);
});

test("new identities receive an applicant profile without metadata-controlled roles", () => {
  const migration = readFileSync(
    join(root, "supabase/migrations/20260731133953_provision_public_auth_users.sql"),
    "utf8",
  );
  assert.match(migration, /after insert or update of email_confirmed_at, last_sign_in_at on auth\.users/i);
  assert.match(migration, /new\.email_confirmed_at is null/);
  assert.match(migration, /'applicant'/);
  assert.doesNotMatch(migration, /raw_user_meta_data\s*->>\s*'role'/i);
  assert.match(migration, /lower\(c\.email\) = normalized_email/);
});
