import type { AiInsight } from "@/lib/dashboard/aiInsights";
import { severityColor } from "@/lib/dashboard/chartColors";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

export function AiInsightsPanel({ insights, copy }: { insights: AiInsight[]; copy: DashboardCopy }) {
  const c = copy.aiInsights;
  return (
    <section>
      <div className="flex items-center gap-2">
        <h2 className="font-serif text-2xl">{c.title}</h2>
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">{c.badge}</span>
      </div>
      {insights.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">{c.empty}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight) => (
            <article key={insight.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
                  style={{ backgroundColor: severityColor[insight.severity] }}
                >
                  {c.category[insight.category as keyof typeof c.category] || insight.category}
                </span>
              </div>
              <p className="mt-2 font-medium">{insight.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
