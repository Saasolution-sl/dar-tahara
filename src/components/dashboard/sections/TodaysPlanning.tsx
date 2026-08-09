import type { PlanningVisit } from "@/lib/dashboard/queries/planning";
import type { DashboardCopy } from "@/i18n/dashboard-copy";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  completed: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  working: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  driving: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  delayed: "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
  cancelled: "border-border bg-secondary/60 text-muted-foreground",
  scheduled: "border-border bg-card text-foreground",
};

export function TodaysPlanning({ visits, copy }: { visits: PlanningVisit[]; copy: DashboardCopy }) {
  const c = copy.planning;
  return (
    <section>
      <h2 className="font-serif text-2xl">{c.title}</h2>
      {visits.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">{c.nothingScheduled}</p>
      ) : (
        <ol className="mt-4 space-y-2 overflow-x-auto">
          {visits.map((visit) => (
            <li key={visit.id} className={cn("flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm", STATUS_STYLE[visit.status] || STATUS_STYLE.scheduled)}>
              <span className="w-16 shrink-0 font-mono text-xs">{new Intl.DateTimeFormat("en", { timeStyle: "short" }).format(new Date(visit.scheduledStart))}</span>
              <span className="font-medium">{visit.customerName}</span>
              <span className="text-xs opacity-80">{visit.address}</span>
              {visit.staffName ? <span className="ms-auto text-xs opacity-80">{visit.staffName}</span> : null}
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide dark:bg-white/10">{c.status[visit.status as keyof typeof c.status] || visit.status}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
