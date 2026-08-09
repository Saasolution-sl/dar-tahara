import "server-only";

import { serviceSelect, serviceInsert, serviceDelete } from "@/lib/supabase-rpc";
import { type DashboardScope } from "@/lib/dashboard/scope";
import { daysAgoIso } from "@/lib/dashboard/dateRange";
import { rephraseInsights } from "@/lib/dashboard/aiInsightsLlm";
import { MAX_PAID_TRAVEL_MINUTES, MAX_WORKDAY_HOURS } from "@/lib/kpi/constants";

/**
 * The rule engine below is the sole source of truth for WHICH situations are
 * noteworthy and WHAT the facts are (thresholds, counts, names), deterministic
 * heuristics computed from real + seeded operational data, refreshed at most
 * hourly per office. If a Gemini-compatible provider is configured (GEMINI_API_KEY
 * + GEMINI_MODEL, or the generic ASSISTANT_* provider, see aiInsightsLlm.ts),
 * an LLM call only rephrases the title/description text for clarity; it never
 * invents facts and the dashboard works identically (with canned phrasing) if
 * that call isn't configured, times out, or fails.
 */

export type AiInsight = {
  id: string;
  officeId: string | null;
  category: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
};

const REGENERATE_AFTER_MS = 60 * 60 * 1000;

type Insight = {
  office_id: string | null;
  category: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  // PostgREST's batch insert requires every row in the array to have the
  // exact same set of keys, these must always be present (as null, not
  // omitted) rather than optional, or insert_ai_insights_failed with
  // PGRST102 "All object keys must match".
  related_customer_id: string | null;
  related_staff_id: string | null;
};

export async function getAiInsights(scope: DashboardScope): Promise<AiInsight[]> {
  const officeIds = scope.officeIds === null ? await allOfficeIdsPlusCompanyWide() : [...scope.officeIds, null];
  await Promise.all(officeIds.map((officeId) => ensureFreshInsights(officeId)));

  const filter =
    scope.officeIds === null
      ? ""
      : scope.officeIds.length === 0
        ? "&office_id=in.(00000000-0000-0000-0000-000000000000)"
        : `&or=(office_id.in.(${scope.officeIds.join(",")}),office_id.is.null)`;

  const rows = await serviceSelect<Array<{
    id: string; office_id: string | null; category: string; severity: string; title: string; description: string;
  }>>(`ai_insights?select=id,office_id,category,severity,title,description&dismissed_at=is.null${filter}&order=severity.desc,created_at.desc&limit=20`);

  return rows.map((row) => ({
    id: row.id,
    officeId: row.office_id,
    category: row.category,
    severity: row.severity as AiInsight["severity"],
    title: row.title,
    description: row.description,
  }));
}

async function allOfficeIdsPlusCompanyWide(): Promise<Array<string | null>> {
  const offices = await serviceSelect<Array<{ id: string }>>("offices?select=id");
  return [...offices.map((office) => office.id), null];
}

async function ensureFreshInsights(officeId: string | null): Promise<void> {
  const officeParam = officeId ? `office_id=eq.${officeId}` : "office_id=is.null";
  const [latest] = await serviceSelect<Array<{ created_at: string }>>(
    `ai_insights?select=created_at&${officeParam}&order=created_at.desc&limit=1`,
  );
  if (latest && Date.now() - new Date(latest.created_at).getTime() < REGENERATE_AFTER_MS) return;

  const insights = officeId === null ? await computeCompanyWideInsights() : await computeOfficeInsights(officeId);
  const officeLabel = officeId ? (await serviceSelect<Array<{ name: string }>>(`offices?select=name&id=eq.${officeId}&limit=1`))[0]?.name || "Office" : "Company-wide";
  const phrased = await rephraseInsights(officeLabel, insights);

  await serviceDelete("ai_insights", officeParam);
  if (phrased.length > 0) await serviceInsert("ai_insights", phrased);
}

async function computeOfficeInsights(officeId: string): Promise<Insight[]> {
  const since30 = daysAgoIso(30);
  const since45 = daysAgoIso(45);
  const since14 = daysAgoIso(14);
  const since7 = daysAgoIso(7);
  const insights: Insight[] = [];

  const [activeCustomers, recentVisits, complaintsThisWeek, complaintsLastWeek, inspectionsRecent, employees, inventory, openInvoices, todaysVisits] =
    await Promise.all([
      serviceSelect<Array<{ id: string; full_name: string }>>(`customers?select=id,full_name&office_id=eq.${officeId}&status=eq.customer`),
      serviceSelect<Array<{ customer_id: string; scheduled_start: string; customer_rating: number | null }>>(
        `service_visits?select=customer_id,scheduled_start,customer_rating&office_id=eq.${officeId}&scheduled_start=gte.${since45}&order=scheduled_start.desc`,
      ),
      serviceSelect<Array<{ id: string }>>(`customer_complaints?select=id&office_id=eq.${officeId}&created_at=gte.${since7}`),
      serviceSelect<Array<{ id: string }>>(`customer_complaints?select=id&office_id=eq.${officeId}&created_at=gte.${since14}&created_at=lt.${since7}`),
      serviceSelect<Array<{ score: number; created_at: string; service_visits: { office_id: string | null } }>>(
        `quality_inspections?select=score,created_at,service_visits!inner(office_id)&created_at=gte.${since30}&service_visits.office_id=eq.${officeId}`,
      ),
      serviceSelect<Array<{ id: string; full_name: string }>>(`staff_members?select=id,full_name&office_id=eq.${officeId}&active=eq.true`),
      serviceSelect<Array<{ id: string; name: string; quantity: number; reorder_threshold: number }>>(
        `inventory_items?select=id,name,quantity,reorder_threshold&office_id=eq.${officeId}`,
      ),
      serviceSelect<Array<{ customers: { id: string; full_name: string; office_id: string | null } }>>(
        `invoices?select=customers!inner(id,full_name,office_id)&status=eq.open&customers.office_id=eq.${officeId}`,
      ),
      serviceSelect<Array<{ assigned_staff_id: string | null; scheduled_start: string; scheduled_end: string; properties: { city: string } | null }>>(
        `service_visits?select=assigned_staff_id,scheduled_start,scheduled_end,properties(city)&office_id=eq.${officeId}&scheduled_start=gte.${new Date(new Date().setHours(0, 0, 0, 0)).toISOString()}&assigned_staff_id=not.is.null`,
      ),
    ]);

  // Inactive customer: active customer with no visit in 45 days.
  const visitedCustomerIds = new Set(recentVisits.map((v) => v.customer_id));
  for (const customer of activeCustomers) {
    if (!visitedCustomerIds.has(customer.id)) {
      insights.push({
        office_id: officeId, category: "inactive_customer", severity: "warning",
        title: `${customer.full_name} has no scheduled visit in 45+ days`,
        description: "Active customer with no recent service history. Check whether a visit needs (re)scheduling.",
        related_customer_id: customer.id, related_staff_id: null,
      });
    }
  }

  // Churn risk: customer whose last two ratings are both <= 3.
  const ratingsByCustomer = new Map<string, number[]>();
  for (const visit of recentVisits) {
    if (visit.customer_rating === null) continue;
    ratingsByCustomer.set(visit.customer_id, [...(ratingsByCustomer.get(visit.customer_id) || []), visit.customer_rating]);
  }
  for (const customer of activeCustomers) {
    const ratings = ratingsByCustomer.get(customer.id);
    if (ratings && ratings.length >= 2 && ratings.slice(0, 2).every((r) => r <= 3)) {
      insights.push({
        office_id: officeId, category: "churn_risk", severity: "critical",
        title: `${customer.full_name} may be at risk of cancelling`,
        description: "Their last two visit ratings were 3 or below. Consider a service-recovery outreach.",
        related_customer_id: customer.id, related_staff_id: null,
      });
    }
  }

  // Complaint trend.
  if (complaintsThisWeek.length > complaintsLastWeek.length && complaintsThisWeek.length >= 2) {
    insights.push({
      office_id: officeId, category: "complaint_trend", severity: "warning",
      title: "Complaints are trending up this week",
      description: `${complaintsThisWeek.length} complaints this week vs ${complaintsLastWeek.length} last week.`,
      related_customer_id: null, related_staff_id: null,
    });
  }

  // Quality drop: this week's avg inspection score vs the trailing 30-day average.
  const thisWeekScores = inspectionsRecent.filter((i) => new Date(i.created_at) >= new Date(since7)).map((i) => i.score);
  const baselineScores = inspectionsRecent.map((i) => i.score);
  if (thisWeekScores.length >= 2 && baselineScores.length >= 4) {
    const thisWeekAvg = thisWeekScores.reduce((a, b) => a + b, 0) / thisWeekScores.length;
    const baselineAvg = baselineScores.reduce((a, b) => a + b, 0) / baselineScores.length;
    if (thisWeekAvg < baselineAvg - 8) {
      insights.push({
        office_id: officeId, category: "quality_drop", severity: "critical",
        title: "Inspection scores dropped this week",
        description: `Average score is ${Math.round(thisWeekAvg)} this week vs a ${Math.round(baselineAvg)} baseline.`,
        related_customer_id: null, related_staff_id: null,
      });
    }
  }

  // Top performer: highest-rated staff member with a meaningful sample size.
  const staffVisits = await serviceSelect<Array<{ assigned_staff_id: string | null; customer_rating: number | null; status: string }>>(
    `service_visits?select=assigned_staff_id,customer_rating,status&office_id=eq.${officeId}&scheduled_start=gte.${since30}&assigned_staff_id=not.is.null`,
  );
  const completedByStaff = new Map<string, number[]>();
  for (const visit of staffVisits) {
    if (!visit.assigned_staff_id || visit.status !== "completed" || visit.customer_rating === null) continue;
    completedByStaff.set(visit.assigned_staff_id, [...(completedByStaff.get(visit.assigned_staff_id) || []), visit.customer_rating]);
  }
  let topPerformer: { staffId: string; avgRating: number; count: number } | null = null;
  for (const [staffId, ratings] of completedByStaff) {
    if (ratings.length < 5) continue;
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    if (avgRating >= 4.7 && (!topPerformer || avgRating > topPerformer.avgRating)) topPerformer = { staffId, avgRating, count: ratings.length };
  }
  if (topPerformer) {
    const staffName = employees.find((e) => e.id === topPerformer!.staffId)?.full_name || "A team member";
    insights.push({
      office_id: officeId, category: "top_performer", severity: "info",
      title: `${staffName} is a top performer`,
      description: `${topPerformer.avgRating.toFixed(1)}★ average across ${topPerformer.count} completed visits in the last 30 days.`,
      related_customer_id: null, related_staff_id: topPerformer.staffId,
    });
  }

  // Supply shortage.
  for (const item of inventory) {
    if (item.quantity <= item.reorder_threshold) {
      insights.push({
        office_id: officeId, category: "supply_shortage", severity: item.quantity === 0 ? "critical" : "warning",
        title: `${item.name} is running low`,
        description: `${item.quantity} ${item.quantity === 1 ? "unit" : "units"} left, at or below the reorder threshold of ${item.reorder_threshold}.`,
        related_customer_id: null, related_staff_id: null,
      });
    }
  }

  // Payment risk.
  const uniqueOpenCustomers = new Map(openInvoices.map((row) => [row.customers.id, row.customers.full_name]));
  for (const [customerId, fullName] of uniqueOpenCustomers) {
    insights.push({
      office_id: officeId, category: "payment_risk", severity: "warning",
      title: `${fullName} has an outstanding invoice`,
      description: "An open invoice is unpaid. Follow up before it escalates to suspension.",
      related_customer_id: customerId, related_staff_id: null,
    });
  }

  // Staff overload: assigned more than 9 scheduled hours today.
  const scheduledMinutesByStaff = new Map<string, number>();
  for (const visit of todaysVisits) {
    if (!visit.assigned_staff_id) continue;
    const minutes = (new Date(visit.scheduled_end).getTime() - new Date(visit.scheduled_start).getTime()) / 60000;
    scheduledMinutesByStaff.set(visit.assigned_staff_id, (scheduledMinutesByStaff.get(visit.assigned_staff_id) || 0) + minutes);
  }
  for (const staff of employees) {
    const minutes = scheduledMinutesByStaff.get(staff.id) || 0;
    if (minutes > 9 * 60) {
      insights.push({
        office_id: officeId, category: "staff_overload", severity: "warning",
        title: `${staff.full_name} is scheduled ${Math.round(minutes / 60)}h today`,
        description: "Consider redistributing today's remaining visits to another team member.",
        related_customer_id: null, related_staff_id: staff.id,
      });
    }
  }

  // Route optimization: staff assigned visits across 3+ distinct cities today.
  const citiesByStaff = new Map<string, Set<string>>();
  for (const visit of todaysVisits) {
    if (!visit.assigned_staff_id || !visit.properties?.city) continue;
    const cities = citiesByStaff.get(visit.assigned_staff_id) || new Set<string>();
    cities.add(visit.properties.city);
    citiesByStaff.set(visit.assigned_staff_id, cities);
  }
  for (const [staffId, cities] of citiesByStaff) {
    if (cities.size < 3) continue;
    const staffName = employees.find((e) => e.id === staffId)?.full_name || "A team member";
    insights.push({
      office_id: officeId, category: "route_optimization", severity: "info",
      title: `${staffName}'s route spans ${cities.size} areas today`,
      description: "Reassigning by proximity could reduce today's total travel time.",
      related_customer_id: null, related_staff_id: staffId,
    });
  }

  // Sickness trend: sick-leave reports starting this week vs last week.
  const [sickLeaveThisWeek, sickLeaveLastWeek, todaysCompletedVisits] = await Promise.all([
    serviceSelect<Array<{ id: string }>>(`staff_sick_leave?select=id&office_id=eq.${officeId}&start_date=gte.${since7.slice(0, 10)}`),
    serviceSelect<Array<{ id: string }>>(`staff_sick_leave?select=id&office_id=eq.${officeId}&start_date=gte.${since14.slice(0, 10)}&start_date=lt.${since7.slice(0, 10)}`),
    serviceSelect<Array<{ travel_minutes: number | null }>>(
      `service_visits?select=travel_minutes&office_id=eq.${officeId}&status=eq.completed&scheduled_start=gte.${new Date(new Date().setHours(0, 0, 0, 0)).toISOString()}&travel_minutes=not.is.null`,
    ),
  ]);
  if (sickLeaveThisWeek.length > sickLeaveLastWeek.length && sickLeaveThisWeek.length >= 2) {
    insights.push({
      office_id: officeId, category: "sickness_trend", severity: "warning",
      title: "Sickness reports are trending up this week",
      description: `${sickLeaveThisWeek.length} sick-leave reports this week vs ${sickLeaveLastWeek.length} last week.`,
      related_customer_id: null, related_staff_id: null,
    });
  }

  // Planner inefficiency: a large share of today's completed visits exceeded the paid-travel limit.
  if (todaysCompletedVisits.length >= 5) {
    const violations = todaysCompletedVisits.filter((v) => (v.travel_minutes || 0) > MAX_PAID_TRAVEL_MINUTES).length;
    const violationRate = violations / todaysCompletedVisits.length;
    if (violationRate > 0.3) {
      insights.push({
        office_id: officeId, category: "planner_inefficiency", severity: "warning",
        title: "Today's schedule has excess travel time",
        description: `${Math.round(violationRate * 100)}% of today's completed visits exceeded the ${MAX_PAID_TRAVEL_MINUTES}-minute travel limit.`,
        related_customer_id: null, related_staff_id: null,
      });
    }
  }

  // Recruitment required: most active field staff are scheduled near or over the max workday today.
  const nearCapacityStaff = employees.filter((staff) => (scheduledMinutesByStaff.get(staff.id) || 0) >= MAX_WORKDAY_HOURS * 60 * 0.9).length;
  if (employees.length >= 3 && nearCapacityStaff / employees.length > 0.5) {
    insights.push({
      office_id: officeId, category: "recruitment_required", severity: "critical",
      title: "Most staff are near full capacity today",
      description: `${nearCapacityStaff} of ${employees.length} active staff are scheduled at or near the ${MAX_WORKDAY_HOURS}h workday limit. Consider hiring.`,
      related_customer_id: null, related_staff_id: null,
    });
  }

  return insights;
}

async function computeCompanyWideInsights(): Promise<Insight[]> {
  const since30 = daysAgoIso(30);
  const offices = await serviceSelect<Array<{ id: string; name: string }>>("offices?select=id,name");
  if (offices.length === 0) return [];

  const officeStats = await Promise.all(
    offices.map(async (office) => {
      const [visits, ratings] = await Promise.all([
        serviceSelect<Array<{ id: string }>>(`service_visits?select=id&office_id=eq.${office.id}&status=eq.completed&scheduled_start=gte.${since30}`),
        serviceSelect<Array<{ customer_rating: number }>>(
          `service_visits?select=customer_rating&office_id=eq.${office.id}&customer_rating=not.is.null&scheduled_start=gte.${since30}`,
        ),
      ]);
      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b.customer_rating, 0) / ratings.length : 0;
      return { office, completedVisits: visits.length, avgRating };
    }),
  );

  const insights: Insight[] = [];
  const best = officeStats.filter((s) => s.avgRating >= 4.5 && s.completedVisits >= 10).sort((a, b) => b.completedVisits - a.completedVisits)[0];
  if (best) {
    insights.push({
      office_id: null, category: "expansion_opportunity", severity: "info",
      title: `${best.office.name} looks ready for expansion`,
      description: `${best.completedVisits} completed visits in the last 30 days with a ${best.avgRating.toFixed(1)}★ average rating.`,
      related_customer_id: null, related_staff_id: null,
    });
  }
  return insights;
}
