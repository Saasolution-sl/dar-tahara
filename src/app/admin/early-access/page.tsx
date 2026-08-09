import { requireRole } from "@/lib/portal-auth";
import { serviceSelect } from "@/lib/supabase-rpc";
import {
  buildEarlyAccessReport,
  type ReportingEvent,
  type ReportingFeedback,
  type ReportingSession,
} from "@/lib/early-access/reporting";

export const dynamic = "force-dynamic";

const SESSION_FIELDS = [
  "id", "status", "email_present", "current_step", "current_step_index", "source_code",
  "utm_source", "referrer_host", "device_type", "browser", "operating_system", "locale", "started_at", "completed_at",
  "abandoned_at", "resumed_at", "reminder_count", "completed_after_reminder",
].join(",");
const EVENT_FIELDS = "signup_session_id,event_name,step_id,step_index,field_name,error_type,error_code,duration_ms";

function pct(value: number) { return `${Math.round(value * 100)}%`; }
function duration(value: number | null) { return value === null ? "—" : `${Math.round(value)} min`; }

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <div className="rounded-2xl border border-border bg-card p-5">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-2 text-3xl font-semibold">{value}</p>
    {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
  </div>;
}

function Breakdown({ title, rows }: { title: string; rows: Array<{ label: string; count: number }> }) {
  return <section className="rounded-2xl border border-border bg-card p-5">
    <h2 className="font-semibold">{title}</h2>
    <div className="mt-4 space-y-2">
      {rows.slice(0, 10).map((row) => <div key={row.label} className="flex justify-between gap-4 text-sm">
        <span className="truncate text-muted-foreground">{row.label.replaceAll("_", " ")}</span><strong>{row.count < 3 ? "<3" : row.count}</strong>
      </div>)}
      {!rows.length && <p className="text-sm text-muted-foreground">No data in this period.</p>}
    </div>
  </section>;
}

export default async function AdminEarlyAccessPage({ searchParams }: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireRole(["administrator"]);
  const params = await searchParams;
  const days = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const [sessions, events, feedback] = await Promise.all([
    serviceSelect<ReportingSession[]>(`early_access_signup_sessions?started_at=gte.${since}&select=${SESSION_FIELDS}&order=started_at.desc&limit=10000`),
    serviceSelect<ReportingEvent[]>(`early_access_funnel_events?occurred_at=gte.${since}&select=${EVENT_FIELDS}&order=occurred_at.asc&limit=50000`),
    serviceSelect<ReportingFeedback[]>(`early_access_abandonment_feedback?submitted_at=gte.${since}&select=reason&limit=10000`),
  ]);
  const report = buildEarlyAccessReport(sessions, events, feedback);
  const s = report.summary;

  return <div className="space-y-8">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">Conversion evidence</p><h1 className="mt-2 text-3xl font-semibold">Early Access funnel</h1><p className="mt-2 text-sm text-muted-foreground">Server-side sessions only; no raw IP addresses or partial form values are shown.</p></div>
      <nav className="flex gap-2">{[7, 30, 90].map((value) => <a key={value} href={`?days=${value}`} className={`rounded-full px-4 py-2 text-sm ${days === value ? "bg-primary text-primary-foreground" : "border border-border"}`}>{value} days</a>)}</nav>
    </header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Sessions viewed" value={s.viewed} note={`${s.identified} email-associated · ${s.anonymous} anonymous`} />
      <Metric label="Started" value={s.started} note={`${pct(s.startRate)} of viewed sessions`} />
      <Metric label="Completed" value={s.completed} note={`${pct(s.completionRate)} session conversion`} />
      <Metric label="Abandoned eligible" value={s.abandoned} note={`${s.resumed} later resumed`} />
      <Metric label="Reminder 1 queued" value={s.reminder1} />
      <Metric label="Reminder 2 queued" value={s.reminder2} />
      <Metric label="Completed after reminder" value={s.completedAfterReminder} />
      <Metric label="Median completion time" value={duration(s.medianCompletionMinutes)} note={`Average ${duration(s.averageCompletionMinutes)}`} />
    </section>

    <section className="overflow-x-auto rounded-2xl border border-border bg-card p-5">
      <h2 className="font-semibold">Step conversion</h2>
      <table className="mt-4 min-w-full text-left text-sm"><thead className="text-muted-foreground"><tr><th className="py-2">Step</th><th>Entered</th><th>Completed</th><th>Dropped</th><th>Rate</th><th>Validation errors</th><th>Median time</th></tr></thead><tbody>
        {report.steps.map((row) => <tr key={row.stepId} className="border-t border-border"><td className="py-3 font-medium">{row.stepIndex + 1}. {row.stepId.replaceAll("_", " ")}</td><td>{row.entered}</td><td>{row.completed}</td><td>{Math.max(0, row.entered - row.completed)}</td><td>{pct(row.completionRate)}</td><td>{row.errors}</td><td>{row.medianSeconds === null ? "—" : `${row.medianSeconds}s`}</td></tr>)}
      </tbody></table>
    </section>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Breakdown title="Acquisition source" rows={report.sources} />
      <Breakdown title="Device" rows={report.devices} />
      <Breakdown title="Browser" rows={report.browsers} />
      <Breakdown title="Operating system" rows={report.operatingSystems} />
      <Breakdown title="Locale" rows={report.locales} />
      <Breakdown title="Validation friction" rows={report.errorFields} />
      <Breakdown title="API and Maps failures" rows={report.apiErrors} />
      <Breakdown title="Likely abandonment category" rows={report.abandonmentCategories} />
      <Breakdown title="Visitor feedback" rows={report.feedbackReasons} />
    </div>

    <p className="text-xs text-muted-foreground">“Reminder queued” means the contact update and Mautic segment assignment succeeded; email delivery/open/click data remains authoritative in Mautic.</p>
  </div>;
}
