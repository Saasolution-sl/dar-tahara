import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceSelect } from "@/lib/supabase-rpc";
import { checkAcStripeQuantityMismatch } from "@/lib/ac-billing-sync";

export const runtime = "nodejs";

type AcUnitRow = {
  id: string;
  unit_code: string;
  room_type: string;
  room_label: string | null;
  coverage_type: string;
  status: string;
  subscription_id: string;
  customers: { full_name: string; email: string };
  properties: { address_line1: string; city: string };
};

export async function GET() {
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rows = await serviceSelect<AcUnitRow[]>(
    `ac_units?select=id,unit_code,room_type,room_label,coverage_type,status,subscription_id,customers(full_name,email),properties(address_line1,city)&order=created_at.desc&limit=500`,
  );

  const entitlementCounts = await serviceSelect<Array<{ ac_unit_id: string; status: string }>>(
    `ac_maintenance_entitlements?select=ac_unit_id,status&ac_unit_id=in.(${rows.map((r) => r.id).join(",") || "00000000-0000-0000-0000-000000000000"})`,
  );

  // One reconciliation check per distinct subscription, not per unit, to
  // avoid redundant Stripe calls for subscriptions with several AC units.
  const subscriptionIds = Array.from(new Set(rows.map((r) => r.subscription_id)));
  const mismatchBySubscription = new Map<string, boolean>();
  await Promise.all(
    subscriptionIds.map(async (id) => {
      try {
        const result = await checkAcStripeQuantityMismatch(id);
        mismatchBySubscription.set(id, !result.matches);
      } catch {
        mismatchBySubscription.set(id, false);
      }
    }),
  );

  const result = rows.map((row) => {
    const completed = entitlementCounts.filter((e) => e.ac_unit_id === row.id && e.status === "completed").length;
    const total = entitlementCounts.filter((e) => e.ac_unit_id === row.id).length;
    return {
      ...row,
      maintenanceCompleted: completed,
      maintenanceTotal: total,
      billingMismatch: mismatchBySubscription.get(row.subscription_id) ?? false,
    };
  });

  return NextResponse.json(result);
}
