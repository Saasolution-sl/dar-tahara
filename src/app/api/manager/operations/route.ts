import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

type AssessmentRow = {
  id: string; reference: string; status: string; payment_status: string; scheduled_at: string | null;
  assessment_completed_at: string | null; assigned_staff_id: string | null; customer_identity_confirmed_at: string | null;
  customer_confirmation_reference: string | null; assessment_outcome: string | null; assessment_notes: string | null;
  proposed_plan: string | null; proposed_recurring_cents: number | null; additional_service_fees_cents: number | null;
  recurring_cleaning_duration_minutes: number | null;
  customers: { full_name: string; email: string };
  properties: { address_line1: string; city: string; property_type: string | null; verified_size_m2: number | null; verified_bedrooms: number | null; verified_bathrooms: number | null; access_method: string | null; air_conditioning_units: number | null; kitchen_count: number | null; living_space_count: number | null; outside_spaces: string[] | null; selected_services: string[] | null };
};
type Staff = { id: string; full_name: string; employee_number: string; role: string };

export async function GET() {
  const auth = await authorizeApi(["manager", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const assessments = await serviceSelect<AssessmentRow[]>(
    "home_assessments?status=in.(assessment,assessment_scheduled,assessment_completed,pending_review,approved,rejected)&select=id,reference,status,payment_status,scheduled_at,assessment_completed_at,assigned_staff_id,customer_identity_confirmed_at,customer_confirmation_reference,assessment_outcome,assessment_notes,proposed_plan,proposed_recurring_cents,additional_service_fees_cents,recurring_cleaning_duration_minutes,customers(full_name,email),properties(address_line1,city,property_type,verified_size_m2,verified_bedrooms,verified_bathrooms,access_method,air_conditioning_units,kitchen_count,living_space_count,outside_spaces,selected_services)&order=created_at.desc&limit=250",
  );
  const staffIds = Array.from(new Set(assessments.map((row) => row.assigned_staff_id).filter(Boolean))) as string[];
  const staff = staffIds.length
    ? await serviceSelect<Staff[]>(`staff_members?id=in.(${staffIds.join(",")})&select=id,full_name,employee_number,role`)
    : [];
  return NextResponse.json({ assessments, staff });
}
