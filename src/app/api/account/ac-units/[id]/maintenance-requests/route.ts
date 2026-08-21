import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { validateAcMaintenanceBooking } from "@/lib/ac-entitlement";

export const runtime = "nodejs";

type AcUnitRow = {
  id: string;
  customer_id: string;
  property_id: string;
  status: "active" | "pending_activation" | "pending_cancellation" | "inactive" | "retired" | "replaced";
  subscriptions: { status: string; operational_status: string } | null;
};

type EntitlementRow = {
  id: string;
  ac_unit_id: string;
  status: "available" | "booked" | "completed" | "expired" | "cancelled";
  service_window_start: string;
  service_window_end: string;
};

/**
 * Books a specific maintenance entitlement against a specific AC unit.
 * Every check that decides whether this is allowed happens here, server
 * side, against rows this route resolved itself (ac_unit_id and
 * entitlement_id are both path/body inputs, never trusted to already
 * belong together) -- this is what makes the "switch included AC then
 * reuse the second visit on the new unit" abuse scenario fail regardless
 * of what the client sends.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["customer", "staff", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id: acUnitId } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const entitlementId = typeof body.entitlementId === "string" ? body.entitlementId : "";
  if (!/^[0-9a-f-]{36}$/i.test(entitlementId)) return NextResponse.json({ error: "invalid_entitlement" }, { status: 400 });

  const unitRows = await serviceSelect<AcUnitRow[]>(
    `ac_units?id=eq.${acUnitId}&select=id,customer_id,property_id,status,subscriptions(status,operational_status)&limit=1`,
  );
  const unit = unitRows[0];
  if (!unit || unit.customer_id !== auth.context.customerId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const entitlementRows = await serviceSelect<EntitlementRow[]>(
    `ac_maintenance_entitlements?id=eq.${entitlementId}&select=id,ac_unit_id,status,service_window_start,service_window_end&limit=1`,
  );
  const entitlement = entitlementRows[0];
  if (!entitlement) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const subscriptionOk = unit.subscriptions?.status === "active" && unit.subscriptions?.operational_status === "active";
  const result = validateAcMaintenanceBooking(
    { id: unit.property_id, customerOwnsProperty: true },
    { id: unit.id, propertyId: unit.property_id, status: unit.status },
    {
      id: entitlement.id, acUnitId: entitlement.ac_unit_id, status: entitlement.status,
      serviceWindowStart: entitlement.service_window_start, serviceWindowEnd: entitlement.service_window_end,
    },
    subscriptionOk ? "active" : "inactive",
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const [appointment] = await serviceInsert<Array<{ id: string }>>("ac_maintenance_appointments", {
    customer_id: auth.context.customerId,
    property_id: unit.property_id,
    ac_unit_id: unit.id,
    entitlement_id: entitlement.id,
    status: "scheduled",
  });
  if (!appointment) return NextResponse.json({ error: "create_failed" }, { status: 500 });

  await serviceUpdate("ac_maintenance_entitlements", `id=eq.${entitlement.id}`, {
    status: "booked",
  });

  return NextResponse.json({ ok: true, appointmentId: appointment.id });
}
