import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalQuestionKey, knowledgeGapFingerprint } from "./knowledge-builder";

const root = process.cwd();

test("similar unanswered questions share a deterministic knowledge-gap cluster", () => {
  const first = knowledgeGapFingerprint("How much is the physical key management fee?", "pricing");
  const second = knowledgeGapFingerprint("What do you charge to hold a physical key?", "pricing");
  assert.equal(first, second);
});

test("one business policy keeps one canonical owner question across every supported language", () => {
  for (const message of [
    "How much is the physical key management fee?",
    "Hoeveel kost het beheer van een fysieke sleutel?",
    "Quel est le prix de la garde d'une clé physique ?",
    "¿Cuánto cuesta la custodia de una llave física?",
    "Welche Gebühr gilt für die Aufbewahrung eines physischen Schlüssels?",
    "Quanto custa a guarda de uma chave física?",
    "كم رسوم تخزين المفتاح؟",
  ]) assert.equal(canonicalQuestionKey(message), "physical-key-fee", message);
});

test("captured gaps route to the seeded canonical owner question per business policy", () => {
  for (const [message, expected] of [
    ["How much is the physical key management fee?", "physical-key-fee"],
    ["Which digital lock models do you support?", "digital-lock-policy"],
    ["How much does the smart lock cost?", "digital-lock-policy"],
    ["Are windows included in my plan?", "included-windows"],
    ["Can I pause my subscription while travelling?", "subscription-pause"],
    ["How long before a cleaning can I cancel?", "cancellation-notice"],
    ["Is my payment refundable?", "refund-policy"],
    ["If I cancel, do I get a refund?", "refund-policy"],
  ] as const) assert.equal(canonicalQuestionKey(message), expected, message);
});

test("unrelated questions do not get routed onto a canonical owner question", () => {
  for (const message of [
    "Do you clean apartments in Rabat?",
    "What time does the cleaner arrive?",
    "How do I update my invoice address?",
  ]) assert.equal(canonicalQuestionKey(message), null, message);
});

test("duplicate owner questions are merged onto the canonical without deleting history", () => {
  const sql = readFileSync(join(root, "supabase/migrations/20260716182221_merge_duplicate_knowledge_questions.sql"), "utf8");
  for (const expected of [
    "create or replace function public.merge_knowledge_builder_question",
    "merge_cannot_supersede_approved_question",
    "status = 'superseded'",
    "'knowledge_question_merged'",
    "grant execute on function public.merge_knowledge_builder_question(uuid, uuid, uuid) to service_role",
  ]) assert.ok(sql.includes(expected), expected);
  assert.doesNotMatch(sql, /delete\s+from/i);
});

test("knowledge gaps are linked only after the conversation has been persisted", () => {
  const builder = readFileSync(join(root, "src/lib/assistant/knowledge-builder.ts"), "utf8");
  const service = readFileSync(join(root, "src/lib/assistant/service.ts"), "utf8");
  assert.doesNotMatch(builder, /last_conversation_id:\s*input\.conversationId/);
  assert.match(service, /await persistAssistantTurn\([\s\S]*last_conversation_id:\s*conversationId/);
});

test("existing owner questions recover and link newly captured gaps", () => {
  const builder = readFileSync(join(root, "src/lib/assistant/knowledge-builder.ts"), "utf8");
  assert.match(builder, /select=id,source_gap_ids/);
  assert.match(builder, /source_gap_ids:\s*\[\.\.\.sourceGapIds, gapId\]/);
  assert.match(builder, /status:\s*"linked",\s*linked_question_id:\s*questionId/);
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

test("owner-approved support and cancellation policy is published through a corrective migration", () => {
  const sql = readFileSync(join(root, "supabase/migrations/20260724002029_align_support_and_cancellation_policy.sql"), "utf8");
  for (const expected of [
    "Dar Tahara Support",
    "09:00–21:00",
    "24 working hours",
    "at least 48 hours",
    "twice per calendar year",
    "cannot be paused",
    "one month",
    "100% of the first subscription payment",
    "service-change-subscription-cancellation",
    "dar-tahara-support-availability",
  ]) assert.ok(sql.includes(expected), expected);
  assert.doesNotMatch(sql, /FreeScout/);
  assert.match(sql, /where question_key = 'subscription-pause'/);
  assert.match(sql, /where question_key = 'cancellation-notice'/);
  assert.match(sql, /where question_key = 'human-escalation-sla'/);
});

test("focus-city correction updates Knowledge Builder and publishes all languages", () => {
  const sql = readFileSync(join(root, "supabase/migrations/20260724004344_update_focus_cities.sql"), "utf8");
  assert.match(sql, /Tetouan, Tangier, Meknes, and Casablanca/);
  assert.match(sql, /where question_key = 'supported-cities-boundaries'/);
  assert.match(sql, /'focus-cities'/);
  assert.doesNotMatch(sql, /currently focuses on Tangier, Casablanca, Rabat and Marrakech/);
});

test("owner-approved assessment and access FAQs are published without hiding unresolved details", () => {
  const sql = readFileSync(join(root, "supabase/migrations/20260724012321_publish_initial_assessment_and_access_faq.sql"), "utf8");
  for (const expected of [
    "All cleaning appointments are prepaid",
    "30 to 90 minutes",
    "installation and configuration add €200",
    "unique four-digit code",
    "secure safe storage, insurance, and transport",
    "initial-assessment-faq",
    "property-access-faq",
  ]) assert.ok(sql.includes(expected), expected);
  for (const questionKey of [
    "first-cleaning-scope",
    "digital-lock-policy",
    "physical-key-fee",
  ]) assert.ok(sql.includes(`where question_key = '${questionKey}'`), questionKey);
  assert.match(sql, /The exact fee amount, billing frequency/);
  assert.match(sql, /Approved lock models, included hardware, warranty terms/);
  assert.doesNotMatch(sql, /set\s+status\s*=\s*'approved'/i);
});

test("owner-approved cleaning-product and visit-scheduling answers are published in every language", () => {
  const sql = readFileSync(join(root, "supabase/migrations/20260724015745_publish_cleaning_products_and_visit_scheduling.sql"), "utf8");
  for (const expected of [
    "only organic cleaning products",
    "chemical deep cleaning",
    "invitation by email and in the customer portal",
    "Subsequent visits are scheduled automatically",
    "efficient routes",
    "available staff",
    "cleaning-products",
    "visit-scheduling",
  ]) assert.ok(sql.includes(expected), expected);
  for (const language of ["'en'", "'nl'", "'fr'", "'es'", "'de'", "'pt'", "'ar'"]) {
    assert.ok(sql.includes(language), language);
  }
});

test("Grok configuration stays server-side and disabled by default", () => {
  const env = readFileSync(join(root, ".env.example"), "utf8");
  assert.match(env, /GROK_ENABLED=false/);
  assert.match(env, /GROK_API_KEY=/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_GROK/);
});
