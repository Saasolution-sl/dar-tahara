import { StatCard } from "@/components/dashboard/StatCard";
import type { TopKpis } from "@/lib/dashboard/queries/kpis";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

/**
 * Two groups, because there are two questions and they have different answers.
 *
 * "Right now" counts `staff_live_status` and links into the Live operations
 * board, so each tile is a filter of the cards directly below it and the six
 * live tiles sum to the number of cards shown. "Today" counts `service_visits`
 * and links into the visits list. Mixing them is what made the dashboard
 * self-contradictory: a visit-based "Running" tile sat above a staff-based
 * board and the two numbers had no reason to match.
 */
export function KpiOverview({ data, copy }: { data: TopKpis; copy: DashboardCopy }) {
  const c = copy.kpiOverview;
  const live = data.live;
  return (
    <section>
      <h2 className="font-serif text-2xl">{c.title}</h2>

      <h3 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">{c.rightNow}</h3>
      <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={c.working} value={live.working} href="/admin/live-operations?status=working" />
        <StatCard label={c.driving} value={live.driving} href="/admin/live-operations?status=driving" />
        <StatCard label={c.onBreak} value={live.break} href="/admin/live-operations?status=break" />
        <StatCard label={c.waiting} value={live.waiting} href="/admin/live-operations?status=waiting" />
        <StatCard label={c.finished} value={live.finished} tone="success" href="/admin/live-operations?status=finished" />
        <StatCard label={c.employeesWorking} value={live.onShift} href="/admin/employees-working" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{c.rightNowFootnote}</p>

      <h3 className="mt-6 text-sm font-medium uppercase tracking-wide text-muted-foreground">{c.today}</h3>
      <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={c.todaysVisits} value={data.todaysVisits} href="/admin/visits?date=today" />
        <StatCard label={c.completed} value={data.completedToday} tone="success" href="/admin/visits?date=today&status=completed" />
        <StatCard label={c.delayed} value={data.delayedToday} tone={data.delayedToday > 0 ? "warning" : "default"} href="/admin/visits?date=today&status=delayed" />
        <StatCard label={c.cancelled} value={data.cancelledToday} tone={data.cancelledToday > 0 ? "critical" : "default"} href="/admin/visits?date=today&status=cancelled" />
        <StatCard label={c.avgCleaningTime} value={data.avgCleaningMinutes} suffix="min" href="/admin/visits?date=today" />
        <StatCard label={c.avgTravelTime} value={data.avgTravelMinutes} suffix="min" href="/admin/visits?date=today" />
        <StatCard label={c.customerRating} value={data.avgCustomerRating} format="rating" suffix="★" href="/admin/visits?rated=1" />
        <StatCard label={c.openComplaints} value={data.openComplaints} tone={data.openComplaints > 0 ? "warning" : "default"} href="/admin/complaints?status=pending" />
        <StatCard label={c.qualityScore} value={data.qualityScore} suffix="/100" href="/admin/inspections" />
      </div>
    </section>
  );
}
