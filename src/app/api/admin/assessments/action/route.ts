import { NextRequest, NextResponse } from "next/server";
import { adminConfigured } from "@/lib/admin-auth";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import type { Locale } from "@/i18n/config";
import { sendWhatsAppText } from "@/lib/whatsapp";
import { calculateAssessmentQuote, TERMS_VERSION, type DurationMonths } from "@/lib/assessment";
import { getDurationTiers } from "@/lib/subscription-duration-config";
import { findDurationTier } from "@/lib/subscription-duration";
import type { FrequencyKey } from "@/lib/pricing";
import { validateAssessmentCompletion } from "@/lib/assessment-completeness";

export const runtime = "nodejs";
const ACTIONS = new Set(["review", "contact", "schedule", "complete", "request_info", "approve", "reject", "cancel", "assign", "message"]);
function nextStatus(action:string,current:string){if(action==="complete")return current==="assessment"?"pending_review":"assessment_completed";return {review:"under_review",contact:"contacted",schedule:"assessment_scheduled",request_info:"additional_information_required",approve:"approved",reject:"rejected",cancel:"cancelled"}[action]||current}

type AssessmentProperty = {
  property_type: string | null;
  declared_size_m2: number;
  verified_size_m2: number | null;
  declared_bedrooms: number;
  verified_bedrooms: number | null;
  access_method: string | null;
  air_conditioning_units: number | null;
  kitchen_count: number | null;
  living_space_count: number | null;
  outside_spaces: string[] | null;
};
type Row = {
  id: string;
  reference: string;
  status: string;
  customer_id: string;
  property_id: string;
  requested_frequency: FrequencyKey;
  requested_duration_months: DurationMonths | null;
  estimated_monthly_cents: number | null;
  estimated_annual_cents: number | null;
  requested_billing_interval: "monthly" | "annual";
  scheduled_at: string | null;
  assessment_completed_at: string | null;
  assigned_staff_id: string | null;
  assigned_inspector_id: string | null;
  assigned_cleaner_id: string | null;
  customers: { email: string; phone:string; full_name: string; preferred_language: Locale };
  properties: AssessmentProperty | AssessmentProperty[];
};
type StaffRow = { id: string; employee_number: string; active: boolean; role?: string };

export async function POST(req: NextRequest) {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const auth=await authorizeApi(["staff","manager","administrator"]);if(!auth.ok)return NextResponse.json({error:auth.error},{status:auth.status});
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  const isManager = auth.context.roles.includes("manager") && !auth.context.roles.includes("administrator");
  if (["approve","reject"].includes(action) && !(await authorizeApi(["manager","administrator"])).ok) return NextResponse.json({error:"forbidden"},{status:403});
  if (isManager && !["approve","reject"].includes(action)) return NextResponse.json({error:"forbidden"},{status:403});
  if (!/^[0-9a-f-]{36}$/i.test(id) || !ACTIONS.has(action)) return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  const rows = await serviceSelect<Row[]>(`home_assessments?id=eq.${id}&select=id,reference,status,customer_id,property_id,requested_frequency,requested_duration_months,estimated_monthly_cents,estimated_annual_cents,requested_billing_interval,scheduled_at,assessment_completed_at,assigned_staff_id,assigned_inspector_id,assigned_cleaner_id,customers(email,phone,full_name,preferred_language),properties(property_type,declared_size_m2,verified_size_m2,declared_bedrooms,verified_bedrooms,access_method,air_conditioning_units,kitchen_count,living_space_count,outside_spaces)&limit=1`);
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (action === "assign") {
    const employeeInput = (
      typeof body.employeeId === "string"
        ? body.employeeId
        : typeof body.cleanerId === "string"
          ? body.cleanerId
          : typeof body.inspectorId === "string"
            ? body.inspectorId
            : ""
    ).trim();
    if (!employeeInput) {
      return NextResponse.json({ error: "assessment_employee_required" }, { status: 400 });
    }
    const employeeFilter = /^[0-9a-f-]{36}$/i.test(employeeInput)
      ? `id=eq.${employeeInput}`
      : `employee_number=eq.${encodeURIComponent(employeeInput)}`;
    const [employee] = await serviceSelect<StaffRow[]>(
      `staff_members?${employeeFilter}&active=eq.true&role=in.(assessment,inspector)&select=id,employee_number,active,role&limit=1`,
    );
    if (!employee?.employee_number?.trim()) {
      return NextResponse.json({ error: "assessment_employee_number_required" }, { status: 409 });
    }
    await serviceUpdate("home_assessments", `id=eq.${id}`, { assigned_staff_id: employee.id });
    await serviceInsert("assessment_events", {
      assessment_id:id,
      event_type:"staff_assigned",
      actor_type:"admin",
      metadata:{employeeId:employee.id,employeeNumber:employee.employee_number},
    });
    return NextResponse.json({ok:true,status:row.status});
  }
  if (action === "message") {
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 1500) : "";
    if (!message) return NextResponse.json({error:"message_required"},{status:400});
    const sent = await sendWhatsAppText(row.customers.phone, message);
    await serviceInsert("customer_messages", {customer_id:row.customer_id,assessment_id:id,channel:"whatsapp",direction:"outbound",recipient:row.customers.phone,body:message,provider_message_id:sent.id,status:sent.id?"sent":"failed",metadata:{actor:"admin"}});
    return NextResponse.json({ok:true,status:row.status});
  }
  if (action === "approve" && !["assessment_completed", "pending_review"].includes(row.status)) {
    return NextResponse.json({ error: "assessment_completion_required" }, { status: 409 });
  }
  if (action === "complete" || action === "approve") {
    const employeeId = row.assigned_staff_id || row.assigned_inspector_id || row.assigned_cleaner_id;
    const [employee] = employeeId
      ? await serviceSelect<StaffRow[]>(
          `staff_members?id=eq.${employeeId}&active=eq.true&select=id,employee_number,active&limit=1`,
        )
      : [];
    const property = Array.isArray(row.properties) ? row.properties[0] : row.properties;
    const completionError = validateAssessmentCompletion({
      scheduledAt: row.scheduled_at,
      completedAt: action === "complete" ? new Date().toISOString() : row.assessment_completed_at,
      employeeId,
      employeeNumber: employee?.employee_number || null,
      findings: property ? {
        propertyType: property.property_type,
        sizeM2: property.verified_size_m2 ?? property.declared_size_m2,
        rooms: property.verified_bedrooms ?? property.declared_bedrooms,
        accessMethod: property.access_method,
        airConditioningUnits: property.air_conditioning_units,
        kitchenCount: property.kitchen_count,
        livingSpaceCount: property.living_space_count,
        outsideSpaces: property.outside_spaces,
      } : null,
    }, action === "approve");
    if (completionError) {
      return NextResponse.json({ error: completionError }, { status: 409 });
    }
  }
  const next=nextStatus(action,row.status);
  const updates: Record<string, unknown> = { status: next, assessment_notes: typeof body.notes === "string" ? body.notes.slice(0, 5000) : null };
  if (action === "review") updates.assessment_started_at = new Date().toISOString();
  if (action === "schedule") { const scheduled=typeof body.scheduledAt==="string"?body.scheduledAt:"";if(!scheduled||!Number.isFinite(Date.parse(scheduled)))return NextResponse.json({error:"invalid_schedule"},{status:400});updates.scheduled_at=new Date(scheduled).toISOString(); }
  if (action === "complete") updates.assessment_completed_at = new Date().toISOString();
  if (action === "approve") updates.approved_at = new Date().toISOString();
  if (action === "reject") updates.decline_reason = typeof body.notes === "string" ? body.notes.slice(0, 2000) : null;
  if (action === "approve" && row.estimated_monthly_cents === null) {
    return NextResponse.json({ error: "proposal_amount_required" }, { status: 409 });
  }
  if (action === "approve" && !row.requested_duration_months) {
    return NextResponse.json({ error: "proposal_duration_required" }, { status: 409 });
  }
  await serviceUpdate("home_assessments", `id=eq.${id}`, updates);
  if (action === "approve") {
    const property = Array.isArray(row.properties) ? row.properties[0] : row.properties;
    if (!property) return NextResponse.json({ error: "property_not_found" }, { status: 409 });
    const tiers = await getDurationTiers();
    const durationMonths = row.requested_duration_months;
    if (!durationMonths) {
      return NextResponse.json({ error: "proposal_duration_required" }, { status: 409 });
    }
    const selectedTier = findDurationTier(tiers, durationMonths);
    const quote = calculateAssessmentQuote(
      property.declared_size_m2,
      row.requested_frequency,
      false,
      false,
      durationMonths,
      tiers,
    );
    const monthly = quote.estimatedMonthlyCents;
    const billed = row.requested_billing_interval === "annual"
      ? quote.estimatedAnnualCents
      : monthly;
    if (monthly === null || billed === null || !selectedTier) {
      return NextResponse.json({ error: "proposal_amount_required" }, { status: 409 });
    }
    const pricingSnapshot = {
      durationTiers: tiers,
      selectedTier,
      priceBeforeDurationDiscountCents: quote.priceBeforeDurationDiscountCents,
      monthlyPriceCents: monthly,
      annualPriceCents: quote.estimatedAnnualCents,
      calculatedAt: new Date().toISOString(),
    };
    await serviceInsert("subscription_proposals", {
      customer_id: row.customer_id,
      property_id: row.property_id,
      assessment_id: id,
      status: "ready",
      frequency: row.requested_frequency,
      billing_interval: row.requested_billing_interval,
      recurring_amount_cents: billed,
      discount_basis_points: row.requested_billing_interval === "annual" ? 500 : 0,
      contract_duration_months: row.requested_duration_months,
      duration_discount_basis_points: Math.round(selectedTier.discountPercentage * 100),
      price_before_duration_discount_cents: quote.priceBeforeDurationDiscountCents,
      minimum_contract_value_cents: quote.minimumContractValueCents,
      pause_eligible: selectedTier.pauseEligible,
      pricing_snapshot: pricingSnapshot,
      pricing_version: TERMS_VERSION,
      terms_version: TERMS_VERSION,
      expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      created_by: auth.context.user.id,
    });
    await serviceInsert("notification_outbox",{customer_id:row.customer_id,template_key:"subscription_proposal_ready",locale:row.customers.preferred_language,channel:"email",recipient:row.customers.email,consent_confirmed:true,payload:{reference:row.reference}});
    await sendTransactionalEmail({template:"subscription_proposal",locale:row.customers.preferred_language,email:row.customers.email,name:row.customers.full_name,reference:row.reference,amount:new Intl.NumberFormat(row.customers.preferred_language,{style:"currency",currency:"EUR"}).format(billed/100),actionUrl:`${process.env.NEXT_PUBLIC_SITE_URL||"https://www.dartahara.com"}/login?next=/account/subscriptions`});
  }
  await serviceInsert("assessment_events", { assessment_id: id, event_type: action, from_status: row.status, to_status: next, actor_type: isManager ? "manager" : "admin", actor_reference:auth.context.user.id, note: typeof body.notes === "string" ? body.notes.slice(0, 2000) : null });
  await serviceInsert("audit_logs",{actor_user_id:auth.context.user.id,action:`assessment_${action}`,resource_type:"home_assessment",resource_id:id,previous_value:{status:row.status},new_value:{status:next}});
  if (action === "complete") await sendTransactionalEmail({ template: "assessment_completed", locale: row.customers.preferred_language, email: row.customers.email, name: row.customers.full_name, reference: row.reference });
  if (action === "reject") await sendTransactionalEmail({ template: "subscription_declined", locale: row.customers.preferred_language, email: row.customers.email, name: row.customers.full_name, reference: row.reference });
  return NextResponse.json({ ok: true, status: next });
}
