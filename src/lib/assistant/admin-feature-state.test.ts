import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFeatureFlagAudit,
  canManageFeatureSettings,
  persistFeatureFlag,
} from "@/lib/feature-admin-state";
import type { FeatureFlag } from "@/lib/feature-flags";

const flag: FeatureFlag = {
  key: "ai_assistant_enabled",
  name: "AI Assistant",
  description: "Controls whether the Dar Tahara AI Assistant is available.",
  enabled: true,
  starts_at: null,
  ends_at: null,
  public_disabled_message: null,
  fallback_cta_label: null,
  fallback_cta_url: null,
  updated_at: new Date(0).toISOString(),
  updated_by: null,
};

test("only the existing administrator role can manage feature settings", () => {
  assert.equal(canManageFeatureSettings(["administrator"]), true);
  assert.equal(canManageFeatureSettings(["staff"]), false);
  assert.equal(canManageFeatureSettings(["manager"]), false);
  assert.equal(canManageFeatureSettings(["regional_manager"]), false);
  assert.equal(canManageFeatureSettings(["customer"]), false);
});

test("disable and enable changes produce complete audit records", () => {
  const actor = "00000000-0000-0000-0000-000000000001";
  const disabledUpdate = { enabled: false, updated_by: actor };
  const disabledAudit = buildFeatureFlagAudit(flag, false, actor, "test-agent", disabledUpdate);
  assert.equal(disabledAudit.action, "feature_disabled");
  assert.equal(disabledAudit.resource_id, "ai_assistant_enabled");
  assert.equal(disabledAudit.previous_value.enabled, true);
  assert.deepEqual(disabledAudit.new_value, disabledUpdate);

  const disabledFlag = { ...flag, ...disabledUpdate };
  const enabledUpdate = { enabled: true, updated_by: actor };
  const enabledAudit = buildFeatureFlagAudit(disabledFlag, true, actor, null, enabledUpdate);
  assert.equal(enabledAudit.action, "feature_enabled");
  assert.equal(enabledAudit.previous_value.enabled, false);
  assert.deepEqual(enabledAudit.new_value, enabledUpdate);
});

test("the first save creates a missing database flag and later saves update it", async () => {
  const calls: string[] = [];
  const dependencies = {
    update: async (_table: string, _filter: string, update: Record<string, unknown>) => {
      calls.push("update");
      return [{ ...flag, ...update } as FeatureFlag];
    },
    upsert: async (_table: string, value: Record<string, unknown>, _onConflict: string) => {
      calls.push("upsert");
      return [value as FeatureFlag];
    },
  };

  const created = await persistFeatureFlag(
    "ai_assistant_enabled",
    undefined,
    flag,
    { enabled: false },
    dependencies,
  );
  assert.equal(created[0].enabled, false);
  assert.deepEqual(calls, ["upsert"]);

  const updated = await persistFeatureFlag(
    "ai_assistant_enabled",
    created[0],
    created[0],
    { enabled: true },
    dependencies,
  );
  assert.equal(updated[0].enabled, true);
  assert.deepEqual(calls, ["upsert", "update"]);
});
