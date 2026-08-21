import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { activateAcCoverage } from "@/lib/ac-coverage";

export const runtime = "nodejs";

type AcUnitRow = {
  id: string;
  customer_id: string;
  subscription_id: string;
  coverage_type: string;
  status: string;
};

/**
 * Designates a registered AC unit as the subscription's included unit.
 * Only usable while the subscription has no other active included unit
 * (auto-designation for a single AC, or first-time selection among several
 * with none chosen yet) -- changing an *already* included unit goes through
 * the admin-only replace flow instead (/api/admin/ac-units/:id/replace),
 * never this endpoint. The migration's partial unique index
 * (ac_units_one_included_per_subscription) is the hard backstop if this
 * check is ever bypassed.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["customer", "staff", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const rows = await serviceSelect<AcUnitRow[]>(
    `ac_units?id=eq.${id}&select=id,customer_id,subscription_id,coverage_type,status&limit=1`,
  );
  const unit = rows[0];
  if (!unit || unit.customer_id !== auth.context.customerId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (unit.status !== "active") return NextResponse.json({ error: "ac_unit_not_active" }, { status: 400 });
  if (unit.coverage_type === "included") return NextResponse.json({ ok: true, id: unit.id });

  const existingIncluded = await serviceSelect<Array<{ id: string }>>(
    `ac_units?subscription_id=eq.${unit.subscription_id}&coverage_type=eq.included&status=in.(active,pending_activation)&select=id&limit=1`,
  );
  if (existingIncluded.length > 0) {
    return NextResponse.json({ error: "included_unit_already_selected" }, { status: 409 });
  }

  const coverageStartedAt = new Date();
  await serviceUpdate("ac_units", `id=eq.${id}`, {
    coverage_type: "included",
    coverage_started_at: coverageStartedAt.toISOString(),
  });
  await activateAcCoverage({ acUnitId: id, subscriptionId: unit.subscription_id, coverageStartedAt });

  return NextResponse.json({ ok: true, id: unit.id });
}
