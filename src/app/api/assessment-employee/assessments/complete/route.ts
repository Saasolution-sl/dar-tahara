import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { validateAssessmentFieldSubmission } from "@/lib/assessment-field-submission";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { createAdminClient } from "@/lib/supabase/admin";
import { serviceDelete, serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

type StaffRow = { id: string; employee_number: string };
type AssessmentRow = {
  id: string;
  reference: string;
  status: string;
  customer_id: string;
  property_id: string;
  scheduled_at: string | null;
  assigned_staff_id: string | null;
  customers: { email: string; full_name: string; preferred_language: Locale };
};
type ConfirmationRow = { id: string };

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["assessment"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [staff] = await serviceSelect<StaffRow[]>(
    `staff_members?auth_user_id=eq.${auth.context.user.id}&active=eq.true&role=in.(assessment,inspector)&select=id,employee_number&limit=1`,
  );
  if (!staff) return NextResponse.json({ error: "assessment_profile_not_found" }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const assessmentId = form?.get("assessmentId");
  const payloadRaw = form?.get("payload");
  const evidence = form?.get("identityEvidence");
  if (typeof assessmentId !== "string" || !/^[0-9a-f-]{36}$/i.test(assessmentId) || typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const parsed = validateAssessmentFieldSubmission(payload);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (!(evidence instanceof File) || evidence.size === 0) {
    return NextResponse.json({ error: "assessment_identity_photo_required" }, { status: 400 });
  }
  if (evidence.size > MAX_EVIDENCE_BYTES || !ALLOWED_MIME_TYPES.has(evidence.type)) {
    return NextResponse.json({ error: "assessment_identity_photo_invalid" }, { status: 400 });
  }

  const [assessment] = await serviceSelect<AssessmentRow[]>(
    `home_assessments?id=eq.${assessmentId}&assigned_staff_id=eq.${staff.id}&select=id,reference,status,customer_id,property_id,scheduled_at,assigned_staff_id,customers(email,full_name,preferred_language)&limit=1`,
  );
  if (!assessment) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!["assessment", "assessment_scheduled"].includes(assessment.status)) {
    return NextResponse.json({ error: "assessment_not_ready" }, { status: 409 });
  }
  if (!assessment.scheduled_at) {
    return NextResponse.json({ error: "assessment_schedule_required" }, { status: 409 });
  }

  const value = parsed.value;
  const completedStatus = assessment.status === "assessment" ? "pending_review" : "assessment_completed";
  const extension = evidence.type === "image/png" ? "png" : evidence.type === "image/webp" ? "webp" : "jpg";
  const storagePath = `${auth.context.user.id}/${assessment.id}/${randomUUID()}.${extension}`;
  const confirmedAt = new Date();
  const retentionDeleteAfter = new Date(confirmedAt.getTime() + 90 * 86400000);
  const storage = createAdminClient().storage.from("assessment-confirmations");
  let confirmationStored = false;

  try {
    const upload = await storage.upload(storagePath, Buffer.from(await evidence.arrayBuffer()), {
      contentType: evidence.type,
      cacheControl: "private, max-age=0",
      upsert: false,
    });
    if (upload.error) throw upload.error;

    await serviceUpdate("properties", `id=eq.${assessment.property_id}`, {
      property_type: value.propertyType,
      verified_size_m2: value.verifiedSizeM2,
      verified_bedrooms: value.verifiedBedrooms,
      verified_bathrooms: value.verifiedBathrooms,
      access_method: value.accessMethod,
      air_conditioning_units: value.airConditioningUnits,
      kitchen_count: value.kitchenCount,
      living_space_count: value.livingSpaceCount,
      outside_spaces: value.outsideSpaces,
      selected_services: value.services,
      customer_cleaning_instructions: value.customerCleaningInstructions,
      cleaning_profile: {
        services: value.services,
        proposedPlan: value.proposedPlan,
        recurringCleaningDurationMinutes: value.recurringCleaningDurationMinutes,
        verifiedCondition: value.verifiedCondition,
        assessedAt: confirmedAt.toISOString(),
        employeeNumber: staff.employee_number,
      },
    });

    const [confirmation] = await serviceInsert<ConfirmationRow[]>("assessment_confirmations", {
      assessment_id: assessment.id,
      customer_id: assessment.customer_id,
      staff_member_id: staff.id,
      customer_confirmation_name: value.customerConfirmationName,
      id_document_type: value.customerIdType,
      evidence_storage_path: storagePath,
      confirmed_services: value.services,
      customer_confirmed_at: confirmedAt.toISOString(),
      retention_delete_after: retentionDeleteAfter.toISOString(),
    });
    confirmationStored = true;

    await serviceUpdate("home_assessments", `id=eq.${assessment.id}`, {
      status: completedStatus,
      assessment_completed_at: confirmedAt.toISOString(),
      customer_identity_confirmed_at: confirmedAt.toISOString(),
      customer_confirmation_reference: confirmation.id,
      assessment_outcome: value.assessmentOutcome,
      verified_condition: value.verifiedCondition,
      recurring_cleaning_duration_minutes: value.recurringCleaningDurationMinutes,
      future_cleaning_duration_minutes: value.recurringCleaningDurationMinutes,
      proposed_plan: value.proposedPlan,
      proposed_recurring_cents: value.proposedRecurringCents,
      additional_service_fees_cents: value.additionalServiceFeesCents,
      initial_deep_clean_required: value.initialDeepCleanRequired,
      property_condition_notes: value.propertyConditionNotes,
      assessment_notes: value.assessmentNotes,
      next_action: "manager_review",
    });

    await Promise.allSettled([
      serviceInsert("assessment_events", {
        assessment_id: assessment.id,
        event_type: "assessment_completed_with_customer_confirmation",
        from_status: assessment.status,
        to_status: completedStatus,
        actor_type: "assessment_employee",
        actor_reference: auth.context.user.id,
        metadata: {
          employeeNumber: staff.employee_number,
          confirmationReference: confirmation.id,
          confirmedServices: value.services,
          evidenceRetentionDeleteAfter: retentionDeleteAfter.toISOString(),
        },
      }),
      serviceInsert("audit_logs", {
        actor_user_id: auth.context.user.id,
        action: "assessment_employee_completed_assessment",
        resource_type: "home_assessment",
        resource_id: assessment.id,
        previous_value: { status: assessment.status },
        new_value: { status: completedStatus, confirmationReference: confirmation.id },
      }),
      sendTransactionalEmail({
        template: "assessment_completed",
        locale: assessment.customers.preferred_language,
        email: assessment.customers.email,
        name: assessment.customers.full_name,
        reference: assessment.reference,
        actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.dartahara.com"}/login?next=/account/assessments`,
      }),
    ]);
    return NextResponse.json({ ok: true, status: completedStatus, confirmationReference: confirmation.id });
  } catch (error) {
    if (confirmationStored) {
      await serviceDelete("assessment_confirmations", `assessment_id=eq.${assessment.id}`).catch(() => undefined);
    }
    await storage.remove([storagePath]).catch(() => undefined);
    console.error("[assessment-employee-complete]", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "assessment_completion_failed" }, { status: 502 });
  }
}
