import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("the assistant flag is persisted enabled-by-default and read dynamically", () => {
  const migration = read("supabase/migrations/20260808222702_add_ai_assistant_feature_flag.sql");
  const flags = read("src/lib/feature-flags.ts");
  const rpc = read("src/lib/supabase-rpc.ts");
  const layout = read("src/app/[locale]/layout.tsx");

  assert.match(migration, /'ai_assistant_enabled'[\s\S]*?true/);
  assert.match(migration, /on conflict \(key\) do nothing/);
  assert.match(flags, /"ai_assistant_enabled"/);
  assert.match(rpc, /serviceSelect[\s\S]*?cache: "no-store"/);
  assert.match(layout, /export const dynamic = "force-dynamic"/);
  assert.match(layout, /featureEnabled\("ai_assistant_enabled"\)/);
  assert.match(layout, /shouldShowAssistantLauncher\(assistantEnabled\)/);
});

test("all customer-facing generation paths use the guarded public service", () => {
  const chatRoute = read("src/app/api/assistant/chat/route.ts");
  const legacyRoute = read("src/app/api/chat/message/route.ts");
  const whatsapp = read("src/lib/whatsapp/orchestrator.ts");
  const client = read("src/components/assistant/website-chat.tsx");

  assert.match(chatRoute, /answerPublicAssistant/);
  assert.match(chatRoute, /status: 503/);
  assert.match(chatRoute, /AI_ASSISTANT_DISABLED_CODE/);
  assert.match(legacyRoute, /POST as postAssistantMessage/);
  assert.match(whatsapp, /answerPublicAssistant/);
  assert.match(whatsapp, /reason: "assistant_disabled"/);
  assert.match(client, /\/api\/assistant\/availability/);
  assert.match(client, /setInterval\([\s\S]*?30_000/);
  assert.match(client, /if \(!available\) return null/);
});

test("the existing administrator RBAC and audit systems own the setting", () => {
  const page = read("src/app/admin/settings/features/page.tsx");
  const route = read("src/app/api/admin/features/route.ts");
  const ui = read("src/components/admin/feature-settings.tsx");

  assert.match(page, /requireRole\(\['administrator'\]\)/);
  assert.match(route, /authorizeApi\(FEATURE_SETTING_ADMIN_ROLES\)/);
  assert.match(route, /canManageFeatureSettings\(auth\.context\.roles\)/);
  assert.match(route, /stored \|\| await getFeatureFlag\(key\)/);
  assert.match(route, /persistFeatureFlag\(key, stored, previous, update/);
  assert.match(route, /serviceInsert\("audit_logs", buildFeatureFlagAudit/);
  assert.match(ui, /assistantDisableWarning/);
});
