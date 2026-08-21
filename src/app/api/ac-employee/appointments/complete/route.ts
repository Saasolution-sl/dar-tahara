import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

type StaffRow = { id: string };
type AppointmentRow = {
  id: string;
  entitlement_id: string;
  status: string;
  assigned_staff_id: string | null;
  customers: { email: string; full_name: string; preferred_language: Locale };
  ac_units: { room_type: string; room_label: string | null };
};

/**
 * Marks an AC maintenance visit complete: records the checklist, flips the
 * appointment and its entitlement to 'completed' (used_at = now), and sends
 * the ac_maintenance_completed email. Mirrors
 * assessment-employee/assessments/complete/route.ts's shape.
 */
export async function POST(req: NextRequest) {
  const auth = await authorizeApi(["staff", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const [staff] = await serviceSelect<StaffRow[]>(
    `staff_members?auth_user_id=eq.${auth.context.user.id}&active=eq.true&select=id&limit=1`,
  );
  if (!staff) return NextResponse.json({ error: "staff_profile_not_found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const appointmentId = typeof body.appointmentId === "string" ? body.appointmentId : "";
  if (!/^[0-9a-f-]{36}$/i.test(appointmentId)) return NextResponse.json({ error: "invalid_appointment" }, { status: 400 });

  const [appointment] = await serviceSelect<AppointmentRow[]>(
    `ac_maintenance_appointments?id=eq.${appointmentId}&select=id,entitlement_id,status,assigned_staff_id,customers(email,full_name,preferred_language),ac_units(room_type,room_label)&limit=1`,
  );
  if (!appointment || appointment.assigned_staff_id !== staff.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (appointment.status === "completed" || appointment.status === "cancelled") {
    return NextResponse.json({ error: "already_finalized" }, { status: 400 });
  }

  const checklist = {
    filter_condition: typeof body.filterCondition === "string" ? body.filterCondition.trim().slice(0, 200) || null : null,
    filter_cleaned: body.filterCleaned === true,
    exterior_cleaned: body.exteriorCleaned === true,
    drainage_inspected: body.drainageInspected === true,
    issue_detected: body.issueDetected === true,
    issue_notes: typeof body.issueNotes === "string" ? body.issueNotes.trim().slice(0, 1000) || null : null,
    employee_notes: typeof body.employeeNotes === "string" ? body.employeeNotes.trim().slice(0, 1000) || null : null,
    before_photo_path: typeof body.beforePhotoPath === "string" ? body.beforePhotoPath : null,
    after_photo_path: typeof body.afterPhotoPath === "string" ? body.afterPhotoPath : null,
  };

  const now = new Date();
  await serviceUpdate("ac_maintenance_appointments", `id=eq.${appointmentId}`, {
    ...checklist,
    status: "completed",
    completed_at: now.toISOString(),
  });
  await serviceUpdate("ac_maintenance_entitlements", `id=eq.${appointment.entitlement_id}`, {
    status: "completed",
    used_at: now.toISOString(),
  });

  if (appointment.customers) {
    const details = appointment.ac_units.room_label || appointment.ac_units.room_type;
    await sendTransactionalEmail({
      template: "ac_maintenance_completed", locale: appointment.customers.preferred_language,
      email: appointment.customers.email, name: appointment.customers.full_name,
      details, date: now.toISOString().slice(0, 10),
    });
  }

  return NextResponse.json({ ok: true });
}
