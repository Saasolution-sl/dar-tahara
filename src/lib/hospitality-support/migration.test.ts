import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const sql = readFileSync(join(process.cwd(), "supabase", "migrations", "20260802180800_hospitality_support_portal.sql"), "utf8");

test("support migration includes RLS, ownership indexes, and idempotency boundaries", () => {
  for (const token of ["support_messages", "support_attachments", "support_reply_submissions", "support_sync_events", "support_notifications"]) assert.match(sql, new RegExp(token));
  assert.match(sql, /enable row level security/);
  assert.match(sql, /customer_id in \([\s\S]*auth\.uid\(\)/);
  assert.match(sql, /unique \(support_request_id, idempotency_key\)/);
  assert.match(sql, /external_event_id text not null unique/);
  assert.match(sql, /unique \(support_request_id, hospitality_support_message_id, notification_type\)/);
  assert.match(sql, /visibility = 'customer'/);
});
