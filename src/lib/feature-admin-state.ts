import type { AppRole } from "@/lib/portal-auth";
import type { FeatureFlag } from "@/lib/feature-flags";

export const FEATURE_SETTING_ADMIN_ROLES = ["administrator"] as const satisfies readonly AppRole[];

export function canManageFeatureSettings(roles: readonly AppRole[]): boolean {
  return roles.includes("administrator");
}

export function buildFeatureFlagAudit(
  previous: FeatureFlag,
  enabled: boolean,
  actorUserId: string,
  userAgent: string | null,
  update: Record<string, unknown>,
) {
  return {
    actor_user_id: actorUserId,
    action: enabled ? "feature_enabled" : "feature_disabled",
    resource_type: "feature_flag",
    resource_id: previous.key,
    previous_value: previous,
    new_value: update,
    user_agent: userAgent,
  };
}

type FeaturePersistenceDependencies = {
  update: (
    table: string,
    filter: string,
    update: Record<string, unknown>,
  ) => Promise<FeatureFlag[]>;
  upsert: (
    table: string,
    value: Record<string, unknown>,
    onConflict: string,
  ) => Promise<FeatureFlag[]>;
};

/** Persist a known fallback flag on first save, then use normal updates. */
export function persistFeatureFlag(
  key: FeatureFlag["key"],
  stored: FeatureFlag | undefined,
  fallback: FeatureFlag,
  update: Record<string, unknown>,
  dependencies: FeaturePersistenceDependencies,
) {
  if (stored) {
    return dependencies.update("feature_flags", `key=eq.${key}`, update);
  }
  return dependencies.upsert("feature_flags", {
    ...fallback,
    ...update,
    key,
  }, "key");
}
