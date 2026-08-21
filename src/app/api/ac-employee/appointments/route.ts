import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

type StaffRow = { id: string; employee_number: string };

/**
 * Assigned AC maintenance appointments for the logged-in staff member,
 * mirroring assessment-employee/assessments/route.ts exactly (same
 * staff_members lookup, same shape of response).
 */
export async function GET() {
  const auth = await authorizeApi(["staff", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const [staff] = await serviceSelect<StaffRow[]>(
    `staff_members?auth_user_id=eq.${auth.context.user.id}&active=eq.true&select=id,employee_number&limit=1`,
  );
  if (!staff) return NextResponse.json({ error: "staff_profile_not_found" }, { status: 404 });

  const rows = await serviceSelect(
    `ac_maintenance_appointments?assigned_staff_id=eq.${staff.id}&status=in.(scheduled,confirmed,in_progress)&select=id,status,scheduled_start,scheduled_end,filter_condition,filter_cleaned,exterior_cleaned,drainage_inspected,issue_detected,issue_notes,employee_notes,customer_notes,before_photo_path,after_photo_path,customers(full_name),properties(address_line1,address_line2,city),ac_units(unit_code,room_type,room_label,brand,model,location_notes,photo_path),ac_maintenance_entitlements(service_window_number)&order=scheduled_start.asc.nullslast&limit=250`,
  );
  return NextResponse.json({ employeeNumber: staff.employee_number, appointments: rows });
}
