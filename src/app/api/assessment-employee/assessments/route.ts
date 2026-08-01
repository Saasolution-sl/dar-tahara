import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

type StaffRow = { id: string; employee_number: string };

export async function GET() {
  const auth = await authorizeApi(["assessment"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const [staff] = await serviceSelect<StaffRow[]>(
    `staff_members?auth_user_id=eq.${auth.context.user.id}&active=eq.true&role=in.(assessment,inspector)&select=id,employee_number&limit=1`,
  );
  if (!staff) return NextResponse.json({ error: "assessment_profile_not_found" }, { status: 404 });

  const rows = await serviceSelect(
    `home_assessments?assigned_staff_id=eq.${staff.id}&status=in.(assessment,assessment_scheduled)&select=id,reference,status,payment_status,scheduled_at,preferred_date,preferred_time_slot,requested_frequency,requested_billing_interval,requested_duration_months,assessment_price_cents,customers(full_name,email,phone),properties(id,address_line1,address_line2,city,postal_code,declared_size_m2,declared_bedrooms,declared_bathrooms,pets,pet_details,smoking,declared_condition,access_notes)&order=scheduled_at.asc.nullslast,preferred_date.asc&limit=250`,
  );
  return NextResponse.json({ employeeNumber: staff.employee_number, assessments: rows });
}
