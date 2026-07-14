import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const sql = readFileSync(
  join(process.cwd(), "supabase", "migrations", "20260714131303_production_whatsapp_support.sql"),
  "utf8",
).toLowerCase();

test("WhatsApp migration contains required private tables, RLS and idempotent queue controls", () => {
  for (const table of [
    "whatsapp_contacts",
    "whatsapp_conversations",
    "whatsapp_messages",
    "support_escalations",
    "knowledge_entries",
    "bot_audit_logs",
    "webhook_events",
  ]) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.match(sql, /unique \(provider, external_event_id\)/);
  assert.match(sql, /external_message_id text not null unique/);
  assert.match(sql, /for update skip locked/);
  assert.match(sql, /from public, anon, authenticated/);
  assert.match(sql, /to service_role/);
});

test("legacy clear WhatsApp identifiers are hashed before the production table is created", () => {
  const renameAt = sql.indexOf("rename to whatsapp_contacts_legacy");
  const hashAt = sql.indexOf(
    "set wa_id = encode(extensions.digest(wa_id, 'sha256'), 'hex')",
  );
  const createAt = sql.indexOf("create table if not exists public.whatsapp_contacts");
  assert.ok(renameAt > -1 && hashAt > renameAt && createAt > hashAt);
});
