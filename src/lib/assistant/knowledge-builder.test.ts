import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { knowledgeGapFingerprint } from "./knowledge-builder";

const root = process.cwd();

test("similar unanswered questions share a deterministic knowledge-gap cluster", () => {
  const first = knowledgeGapFingerprint("How much is the physical key management fee?", "pricing");
  const second = knowledgeGapFingerprint("What do you charge to hold a physical key?", "pricing");
  assert.equal(first, second);
});

test("knowledge gaps are linked only after the conversation has been persisted", () => {
  const builder = readFileSync(join(root, "src/lib/assistant/knowledge-builder.ts"), "utf8");
  const service = readFileSync(join(root, "src/lib/assistant/service.ts"), "utf8");
  assert.doesNotMatch(builder, /last_conversation_id:\s*input\.conversationId/);
  assert.match(service, /await persistAssistantTurn\([\s\S]*last_conversation_id:\s*conversationId/);
});

test("Knowledge Builder migration protects drafts and publishes approved versions atomically", () => {
  const sql = readFileSync(join(root, "supabase/migrations/20260716151742_assistant_knowledge_builder.sql"), "utf8");
  for (const status of [
    "draft_question", "awaiting_owner_answer", "owner_answered", "needs_clarification",
    "pending_approval", "approved", "rejected", "superseded", "archived",
  ]) assert.ok(sql.includes(`'${status}'`), status);
  for (const expected of [
    "create table if not exists public.assistant_knowledge_gaps",
    "create table if not exists public.assistant_provider_events",
    "alter table public.knowledge_builder_questions enable row level security",
    "revoke all on table public.knowledge_builder_questions",
    "create or replace function public.approve_knowledge_builder_question",
    "if q.status <> 'pending_approval'",
    "insert into public.knowledge_article_versions",
    "set status = 'archived'",
    "insert into public.knowledge_entries",
    "set status = 'resolved'",
    "on conflict (question_key) do nothing",
  ]) assert.ok(sql.includes(expected), expected);
  for (const key of [
    "pricing-custom-over-250", "included-windows", "first-cleaning-scope", "subscription-pause",
    "physical-key-fee", "digital-lock-policy", "cancellation-notice", "refund-policy",
    "supported-cities-boundaries", "human-escalation-sla",
  ]) assert.ok(sql.includes(`('${key}',`), key);
});

test("Grok configuration stays server-side and disabled by default", () => {
  const env = readFileSync(join(root, ".env.example"), "utf8");
  assert.match(env, /GROK_ENABLED=false/);
  assert.match(env, /GROK_API_KEY=/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_GROK/);
});
