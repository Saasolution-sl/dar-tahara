import type { PortalCopy } from "@/i18n/portal-copy";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { shortDate } from "@/lib/portal-format";
import { AddAcUnitModal } from "./AcUnitModal";
import { AcMaintenanceButton } from "./AcMaintenanceButton";
import { SelectIncludedAcButton } from "./SelectIncludedAcButton";

type AcUnitRow = {
  id: string;
  room_type: string;
  room_label: string | null;
  coverage_type: "included" | "paid_addon";
  status: string;
  unit_code: string;
};

type EntitlementRow = {
  id: string;
  ac_unit_id: string;
  status: "available" | "booked" | "completed" | "expired" | "cancelled";
  service_window_start: string;
  service_window_end: string;
};

function roomName(copy: PortalCopy["acMaintenance"], unit: AcUnitRow): string {
  if (unit.room_label) return unit.room_label;
  return copy.roomTypes[unit.room_type] || unit.room_type;
}

export async function AcMaintenanceSection({
  subscriptionId,
  propertyId,
  locale,
  copy,
}: {
  subscriptionId: string;
  propertyId: string;
  locale: Locale;
  copy: PortalCopy["acMaintenance"];
}) {
  const db = await createClient();
  const { data: units } = await db
    .from("ac_units")
    .select("id,room_type,room_label,coverage_type,status,unit_code")
    .eq("subscription_id", subscriptionId)
    .in("status", ["active", "pending_activation"])
    .order("created_at", { ascending: true });
  const acUnits = (units || []) as AcUnitRow[];

  const unitIds = acUnits.map((u) => u.id);
  const { data: entitlements } = unitIds.length
    ? await db
        .from("ac_maintenance_entitlements")
        .select("id,ac_unit_id,status,service_window_start,service_window_end")
        .in("ac_unit_id", unitIds)
        .order("service_window_start", { ascending: true })
    : { data: [] as EntitlementRow[] };
  const entitlementRows = (entitlements || []) as EntitlementRow[];

  const includedUnit = acUnits.find((u) => u.coverage_type === "included");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="mt-5 min-w-0 rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">{copy.title}</h4>
        <AddAcUnitModal propertyId={propertyId} copy={copy} />
      </div>

      {acUnits.length === 0 ? (
        <div className="mt-4 rounded-lg bg-secondary/60 p-4">
          <p className="text-sm font-medium">{copy.noUnitsTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.noUnitsBody}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {acUnits.map((unit) => {
            const unitEntitlements = entitlementRows.filter((e) => e.ac_unit_id === unit.id);
            const completed = unitEntitlements.filter((e) => e.status === "completed").length;
            const total = unitEntitlements.length;
            const available = unitEntitlements.find((e) => e.status === "available" && e.service_window_start <= today);
            const upcoming = unitEntitlements
              .filter((e) => e.status === "available" && e.service_window_start > today)
              .sort((a, b) => a.service_window_start.localeCompare(b.service_window_start))[0];

            return (
              <div key={unit.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{roomName(copy, unit)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {unit.coverage_type === "included" ? copy.includedBadge : copy.addonPriceLabel}
                    </p>
                  </div>
                  {total > 0 ? (
                    <span className="rounded-full bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground">
                      {copy.maintenanceThisYear.replace("{completed}", String(completed)).replace("{total}", String(total))}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3">
                  {unit.coverage_type === "paid_addon" && !includedUnit ? null : null}
                  {available ? (
                    <AcMaintenanceButton acUnitId={unit.id} entitlementId={available.id} copy={copy} />
                  ) : upcoming ? (
                    <p className="text-xs text-muted-foreground">
                      {copy.nextWindowFrom.replace("{date}", shortDate(upcoming.service_window_start, locale))}
                    </p>
                  ) : total === 0 ? (
                    <p className="text-xs text-muted-foreground">{copy.selectIncludedPrompt}</p>
                  ) : null}
                </div>
              </div>
            );
          })}

          {!includedUnit && acUnits.length > 0 ? (
            <div className="rounded-lg bg-secondary/60 p-3">
              <p className="text-xs text-muted-foreground">{copy.selectIncludedPrompt}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {acUnits.map((unit) => (
                  <SelectIncludedAcButton key={unit.id} acUnitId={unit.id} label={roomName(copy, unit)} copy={copy} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
