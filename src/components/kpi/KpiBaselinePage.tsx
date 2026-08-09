import { getDashboardScope } from "@/lib/dashboard/scope";
import { resolvePeriodRange, type KpiPeriod } from "@/lib/kpi/periods";
import { getPersonnelKpis, getBusinessKpis } from "@/lib/kpi";
import { PeriodSelector } from "@/components/kpi/PeriodSelector";
import { PersonnelKpiSection } from "@/components/kpi/PersonnelKpiSection";
import { BusinessKpiSection } from "@/components/kpi/BusinessKpiSection";
import type { AuthContext } from "@/lib/portal-auth";
import { kpiCopy } from "@/i18n/kpi-copy";
import { getRequestLocale } from "@/lib/request-locale";

const VALID_PERIODS: readonly KpiPeriod[] = ["daily", "weekly", "monthly", "quarterly", "yearly", "custom"];

function isKpiPeriod(value: string | undefined): value is KpiPeriod {
  return Boolean(value) && VALID_PERIODS.includes(value as KpiPeriod);
}

export async function KpiBaselinePage({
  context,
  searchParams,
}: {
  context: AuthContext;
  searchParams: { period?: string; from?: string; to?: string };
}) {
  const scope = getDashboardScope(context);
  if (!scope) return null;

  const copy = kpiCopy[await getRequestLocale()];
  const period: KpiPeriod = isKpiPeriod(searchParams.period) ? searchParams.period : "monthly";
  const range = resolvePeriodRange(period, period === "custom" ? { from: searchParams.from || "", to: searchParams.to || "" } : undefined);
  const periodLabelKeyMap = { today: copy.periodLabels.today, this_week: copy.periodLabels.thisWeek, this_month: copy.periodLabels.thisMonth, previous_period: copy.periodLabels.previousPeriod };
  const rangeLabel = range.labelKey ? periodLabelKeyMap[range.labelKey] : range.label;

  const [personnelKpis, businessKpis] = await Promise.all([
    getPersonnelKpis(scope, range),
    scope.role === "manager" ? Promise.resolve(null) : getBusinessKpis(scope, range),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">{copy.eyebrow}</p>
        <h1 className="mt-1 font-serif text-3xl">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{rangeLabel}</p>
      </div>
      <PeriodSelector current={period} from={searchParams.from} to={searchParams.to} copy={copy.period} />
      <PersonnelKpiSection kpis={personnelKpis} copy={copy} />
      {businessKpis ? <BusinessKpiSection kpis={businessKpis} copy={copy} /> : null}
    </div>
  );
}
