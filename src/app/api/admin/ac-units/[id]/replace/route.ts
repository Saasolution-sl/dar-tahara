import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { validateAcReplacement } from "@/lib/ac-entitlement";
import { activateAcCoverage } from "@/lib/ac-coverage";

export const runtime = "nodejs";

const VALID_REASONS = [
  "removed", "replaced", "moved_property", "incorrect_before_maintenance", "admin_correction",
] as const;

type CurrentUnitRow = { id: string; subscription_id: string; status: string; coverage_type: string };
type NewUnitRow = { id: string; subscription_id: string; status: string; coverage_type: string };

/**
 * Admin-only controlled replacement of a subscription's included AC unit
 * (spec §5): the current unit is retired -- never deleted, never rewritten
 * -- and a different, already-registered unit is designated included in its
 * place with a fresh benefit-window ledger. Every call is audit-logged with
 * the reason, matching every other admin override in this codebase
 * (see admin/subscriptions/[id]/duration/route.ts).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: currentUnitId } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const reason = typeof body.reason === "string" ? body.reason : "";
  const newIncludedAcUnitId = typeof body.newIncludedAcUnitId === "string" ? body.newIncludedAcUnitId : "";
  if (!VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])) {
    return NextResponse.json({ error: "invalid_replacement_reason" }, { status: 400 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(newIncludedAcUnitId)) {
    return NextResponse.json({ error: "invalid_new_unit" }, { status: 400 });
  }

  const [currentUnit] = await serviceSelect<CurrentUnitRow[]>(
    `ac_units?id=eq.${currentUnitId}&select=id,subscription_id,status,coverage_type&limit=1`,
  );
  if (!currentUnit || currentUnit.coverage_type !== "included") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const [newUnit] = await serviceSelect<NewUnitRow[]>(
    `ac_units?id=eq.${newIncludedAcUnitId}&select=id,subscription_id,status,coverage_type&limit=1`,
  );
  if (!newUnit || newUnit.subscription_id !== currentUnit.subscription_id) {
    return NextResponse.json({ error: "new_unit_not_on_subscription" }, { status: 400 });
  }
  if (newUnit.status !== "active" || newUnit.coverage_type === "included") {
    return NextResponse.json({ error: "new_unit_not_eligible" }, { status: 400 });
  }

  const completedRows = await serviceSelect<Array<{ id: string }>>(
    `ac_maintenance_entitlements?ac_unit_id=eq.${currentUnitId}&status=eq.completed&select=id&limit=1`,
  );
  const validation = validateAcReplacement(
    { status: currentUnit.status as "active", hasCompletedMaintenance: completedRows.length > 0 },
    reason,
  );
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

  const now = new Date();
  await serviceUpdate("ac_units", `id=eq.${currentUnitId}`, {
    status: "retired",
    retired_at: now.toISOString(),
    replacement_reason: reason,
    replaced_by_ac_id: newIncludedAcUnitId,
  });
  await serviceUpdate("ac_units", `id=eq.${newIncludedAcUnitId}`, {
    coverage_type: "included",
    coverage_started_at: now.toISOString(),
  });
  await activateAcCoverage({ acUnitId: newIncludedAcUnitId, subscriptionId: currentUnit.subscription_id, coverageStartedAt: now });

  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: "ac_included_unit_replaced",
    resource_type: "ac_unit",
    resource_id: currentUnitId,
    previous_value: { included_ac_unit_id: currentUnitId },
    new_value: { included_ac_unit_id: newIncludedAcUnitId, reason },
  });

  return NextResponse.json({ ok: true, retiredUnitId: currentUnitId, newIncludedUnitId: newIncludedAcUnitId });
}
