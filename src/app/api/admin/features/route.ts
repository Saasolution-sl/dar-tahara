import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import {
  FEATURE_KEYS,
  getFeatureFlag,
  type FeatureFlag,
  type FeatureKey,
} from "@/lib/feature-flags";
import {
  buildFeatureFlagAudit,
  canManageFeatureSettings,
  FEATURE_SETTING_ADMIN_ROLES,
  persistFeatureFlag,
} from "@/lib/feature-admin-state";
import { serviceInsert, serviceSelect, serviceUpdate, serviceUpsert } from "@/lib/supabase-rpc";
import { isSameOrigin } from "@/lib/request-security";

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) || null : null;
}

function validUrl(value: string | null) {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

async function patchFeatureFlag(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });

  const auth = await authorizeApi(FEATURE_SETTING_ADMIN_ROLES);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!canManageFeatureSettings(auth.context.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const key = typeof body.key === "string" && FEATURE_KEYS.includes(body.key as FeatureKey)
    ? body.key as FeatureKey
    : null;
  if (!key || typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "invalid_feature" }, { status: 400 });
  }

  const fallback = text(body.fallback_cta_url, 500);
  if (!validUrl(fallback)) return NextResponse.json({ error: "invalid_fallback_url" }, { status: 400 });

  const stored = (await serviceSelect<FeatureFlag[]>(
    `feature_flags?key=eq.${key}&select=*&limit=1`,
  ))[0];
  const previous = stored || await getFeatureFlag(key);

  const update = {
    enabled: body.enabled,
    starts_at: text(body.starts_at, 40),
    ends_at: text(body.ends_at, 40),
    public_disabled_message: text(body.public_disabled_message, 2000),
    fallback_cta_label: text(body.fallback_cta_label, 120),
    fallback_cta_url: fallback,
    updated_by: auth.context.user.id,
  };
  const rows = await persistFeatureFlag(key, stored, previous, update, {
    update: (table, filter, value) => serviceUpdate<FeatureFlag[]>(table, filter, value),
    upsert: (table, value, onConflict) => serviceUpsert<FeatureFlag[]>(table, value, onConflict),
  });

  await serviceInsert("audit_logs", buildFeatureFlagAudit(
    previous,
    body.enabled,
    auth.context.user.id,
    req.headers.get("user-agent")?.slice(0, 500) || null,
    update,
  ));

  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest) {
  return patchFeatureFlag(req);
}
