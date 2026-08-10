import { StatCard } from "@/components/dashboard/StatCard";
import type { TopKpis } from "@/lib/dashboard/queries/kpis";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

export function KpiOverview({ data, copy }: { data: TopKpis; copy: DashboardCopy }) {
  const c = copy.kpiOverview;
  return (
    <section>
      <h2 className="font-serif text-2xl">{c.title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={c.todaysVisits} value={data.todaysVisits} />
        <StatCard label={c.completed} value={data.completedToday} tone="success" />
        <StatCard label={c.running} value={data.runningNow} />
        <StatCard label={c.delayed} value={data.delayedToday} tone={data.delayedToday > 0 ? "warning" : "default"} />
        <StatCard label={c.cancelled} value={data.cancelledToday} tone={data.cancelledToday > 0 ? "critical" : "default"} />
        <StatCard label={c.employeesWorking} value={data.employeesWorking} href="/admin/employees-working" />
        <StatCard label={c.customerRating} value={data.avgCustomerRating} format="rating" suffix="★" />
        <StatCard label={c.avgCleaningTime} value={data.avgCleaningMinutes} suffix="min" />
        <StatCard label={c.avgTravelTime} value={data.avgTravelMinutes} suffix="min" />
        <StatCard label={c.openComplaints} value={data.openComplaints} tone={data.openComplaints > 0 ? "warning" : "default"} href="/admin/complaints?status=pending" />
        <StatCard label={c.qualityScore} value={data.qualityScore} suffix="/100" />
      </div>
    </section>
  );
}
