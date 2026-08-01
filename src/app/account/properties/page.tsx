import { PortalCard } from "@/components/portal/portal-shell";
import {
  PropertiesTable,
  type PortalPropertyRow,
} from "@/components/portal/PropertiesTable";
import { AssessmentPaymentReturn } from "@/components/portal/AssessmentPaymentReturn";
import { portalCopy } from "@/i18n/portal-copy";
import { requireCustomerPortal } from "@/lib/feature-flags";
import { shortDate } from "@/lib/portal-format";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { propertyPortalState } from "@/lib/property-portal-state";
import { createClient } from "@/lib/supabase/server";

type SubscriptionRef = { frequency: string; status: string; created_at: string };
type AssessmentRef = {
  id: string;
  property_id: string;
  reference: string;
  status: string;
  payment_status: string;
  requested_frequency: string;
  assigned_staff_id: string | null;
  assigned_inspector_id: string | null;
  assigned_cleaner_id: string | null;
  submitted_at: string | null;
  scheduled_at: string | null;
  preferred_date: string | null;
  assessment_completed_at: string | null;
  approved_at: string | null;
  created_at: string;
};
type ProposalRef = {
  assessment_id: string;
  accepted_at: string | null;
};
type StaffRef = { id: string; employee_number: string };

const CONFIRMED_ASSESSMENT_STATUSES = new Set([
  "assessment_completed",
  "pending_review",
  "approved",
  "subscription_active",
  "paused",
]);

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ assessment?: string; session_id?: string }>;
}) {
  await requireCustomerPortal();
  const context = await requireAuth();
  const locale = await getRequestLocale();
  const { assessment: assessmentReturn, session_id: sessionId = "" } =
    await searchParams;
  const c = portalCopy[locale];
  const db = await createClient();
  const customerId =
    context.customerId || "00000000-0000-0000-0000-000000000000";
  const { data } = await db
    .from("properties")
    .select(
      "id,address_line1,city,property_type,verified_size_m2,declared_size_m2,verified_bedrooms,declared_bedrooms,access_method,air_conditioning_units,kitchen_count,living_space_count,outside_spaces,pets,subscriptions(frequency,status,created_at)",
    )
    .eq("customer_id", customerId);

  const propertyIds = (data || []).map((property) => property.id);
  const { data: assessments } = propertyIds.length
    ? await db
        .from("home_assessments")
        .select(
          "id,property_id,reference,status,payment_status,requested_frequency,assigned_staff_id,assigned_inspector_id,assigned_cleaner_id,submitted_at,scheduled_at,preferred_date,assessment_completed_at,approved_at,created_at",
        )
        .eq("customer_id", customerId)
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false })
    : { data: [] as AssessmentRef[] };

  const latestAssessmentByProperty = new Map<string, AssessmentRef>();
  for (const assessment of (assessments || []) as AssessmentRef[]) {
    if (!latestAssessmentByProperty.has(assessment.property_id)) {
      latestAssessmentByProperty.set(assessment.property_id, assessment);
    }
  }

  const assessmentIds = Array.from(latestAssessmentByProperty.values()).map(
    (assessment) => assessment.id,
  );
  const { data: acceptedProposals } = assessmentIds.length
    ? await db
        .from("subscription_proposals")
        .select("assessment_id,accepted_at")
        .in("assessment_id", assessmentIds)
        .eq("status", "accepted")
        .order("accepted_at", { ascending: false })
    : { data: [] as ProposalRef[] };
  const acceptedAtByAssessment = new Map<string, string>();
  for (const proposal of (acceptedProposals || []) as ProposalRef[]) {
    if (
      proposal.accepted_at &&
      !acceptedAtByAssessment.has(proposal.assessment_id)
    ) {
      acceptedAtByAssessment.set(proposal.assessment_id, proposal.accepted_at);
    }
  }

  const staffIds = Array.from(
    new Set(
      Array.from(latestAssessmentByProperty.values())
        .flatMap((assessment) => [
          assessment.assigned_staff_id,
          assessment.assigned_inspector_id,
          assessment.assigned_cleaner_id,
        ])
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const { data: staff } = staffIds.length
    ? await db
        .from("staff_members")
        .select("id,employee_number")
        .in("id", staffIds)
    : { data: [] as StaffRef[] };
  const employeeNumberById = new Map(
    (staff || []).map((employee: StaffRef) => [
      employee.id,
      employee.employee_number,
    ]),
  );

  const rows: PortalPropertyRow[] = (data || []).flatMap((property) => {
    const subscriptions = (
      Array.isArray(property.subscriptions)
        ? property.subscriptions
        : property.subscriptions
          ? [property.subscriptions]
          : []
    ) as SubscriptionRef[];
    const activeSubscription =
      subscriptions.find((subscription) => subscription.status === "active") ||
      subscriptions[0];
    const assessment = latestAssessmentByProperty.get(property.id);
    const staffId =
      assessment?.assigned_staff_id ||
      assessment?.assigned_inspector_id ||
      assessment?.assigned_cleaner_id ||
      null;
    const employeeNumber = staffId
      ? employeeNumberById.get(staffId) || null
      : null;
    const confirmedAssessment = Boolean(
      assessment &&
        employeeNumber &&
        CONFIRMED_ASSESSMENT_STATUSES.has(assessment.status),
    );
    const portalState = propertyPortalState({
      hasAssessment: Boolean(assessment),
      paymentStatus: assessment?.payment_status || null,
      assessmentConfirmed: confirmedAssessment,
    });
    if (portalState === "hidden") return [];
    const acceptedAt = assessment
      ? acceptedAtByAssessment.get(assessment.id) ||
        assessment.approved_at ||
        activeSubscription?.created_at
      : null;

    return [{
      id: property.id,
      portalState,
      addressLine1: property.address_line1,
      city: property.city,
      propertyType: property.property_type,
      sizeM2:
        property.verified_size_m2 ?? property.declared_size_m2 ?? 0,
      rooms:
        property.verified_bedrooms ?? property.declared_bedrooms ?? 0,
      accessMethod: property.access_method,
      airConditioningUnits: property.air_conditioning_units ?? 0,
      kitchenCount: property.kitchen_count ?? 0,
      livingSpaceCount: property.living_space_count ?? 0,
      outsideSpaces: Array.isArray(property.outside_spaces)
        ? property.outside_spaces
        : [],
      frequency:
        activeSubscription?.frequency ||
        assessment?.requested_frequency ||
        null,
      pets: Boolean(property.pets),
      employeeNumber: confirmedAssessment ? employeeNumber : null,
      assessmentReference: confirmedAssessment
        ? assessment?.reference || null
        : null,
      assessmentSubmittedAt: assessment
        ? shortDate(assessment.submitted_at || assessment.created_at, locale)
        : null,
      assessmentScheduledAt:
        assessment?.scheduled_at || assessment?.preferred_date
        ? shortDate(
            assessment.scheduled_at || assessment.preferred_date,
            locale,
          )
        : null,
      assessmentAcceptedAt:
        confirmedAssessment && acceptedAt
          ? shortDate(acceptedAt, locale)
          : null,
    }];
  });

  return (
    <div>
      {assessmentReturn === "payment_complete" && sessionId ? (
        <AssessmentPaymentReturn sessionId={sessionId} locale={locale} />
      ) : null}
      <h1 className="font-serif text-4xl">{c.nav.properties}</h1>
      <div className="mt-7">
        {rows.length ? (
          <PropertiesTable
            rows={rows}
            copy={c.properties}
            statusLabel={c.dashboard.status}
          />
        ) : (
          <PortalCard title={c.nav.properties}>
            <p className="text-sm text-muted-foreground">
              {c.dashboard.empty}
            </p>
          </PortalCard>
        )}
      </div>
    </div>
  );
}
