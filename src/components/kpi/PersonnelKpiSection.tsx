"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { KpiScoreCard } from "@/components/kpi/KpiScoreCard";
import { Heatmap } from "@/components/kpi/Heatmap";
import { chartPalette, brand } from "@/lib/dashboard/chartColors";
import type { PersonnelKpis } from "@/lib/kpi";
import type { KpiCopy } from "@/i18n/kpi-copy";

export function PersonnelKpiSection({ kpis, copy }: { kpis: PersonnelKpis; copy: KpiCopy }) {
  const p = copy.personnel;
  const attendanceData = [
    { name: p.attendanceStatus.present, value: kpis.attendance.breakdown.present },
    { name: p.attendanceStatus.late, value: kpis.attendance.breakdown.late },
    { name: p.attendanceStatus.absent, value: kpis.attendance.breakdown.absent },
    { name: p.attendanceStatus.noShow, value: kpis.attendance.breakdown.noShow },
  ].filter((d) => d.value > 0);

  const cleaningPerfData = [
    { name: p.cleaningPerf.faster, value: kpis.cleaningPerformance.breakdown.faster },
    { name: p.cleaningPerf.withinTarget, value: kpis.cleaningPerformance.breakdown.withinTarget },
    { name: p.cleaningPerf.longer, value: kpis.cleaningPerformance.breakdown.longer },
  ];

  const durationClassData = Object.entries(kpis.sickLeave.summary.durationClasses).map(([key, value]) => ({
    name: p.durationClass[key as keyof typeof p.durationClass] || key,
    value,
  }));

  const sickLeaveHeatmapRows = kpis.sickLeave.summary.perCity.map((c) => c.city);
  const sickLeaveHeatmapData: Record<string, Record<string, number>> = {};
  for (const city of kpis.sickLeave.summary.perCity) {
    sickLeaveHeatmapData[city.city] = { [p.heatmapColumns.reports]: city.reportCount, [p.heatmapColumns.sickDays]: city.totalSickDays };
  }

  return (
    <section>
      <h2 className="font-serif text-2xl">{p.title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiScoreCard kpi={kpis.utilization} copy={copy} />
        <KpiScoreCard kpi={kpis.cleaningPerformance} copy={copy} />
        <KpiScoreCard kpi={kpis.punctuality} copy={copy} />
        <KpiScoreCard kpi={kpis.travelPerformance} copy={copy} />
        <KpiScoreCard kpi={kpis.attendance} copy={copy} />
        <KpiScoreCard kpi={kpis.sickLeave} copy={copy} />
        <KpiScoreCard kpi={kpis.qualityScore} copy={copy} />
        <KpiScoreCard kpi={kpis.retention} copy={copy} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-sm font-medium text-muted-foreground">{p.attendanceBreakdown}</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                  {attendanceData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-sm font-medium text-muted-foreground">{p.cleaningPerformanceChart}</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cleaningPerfData}>
                <CartesianGrid strokeDasharray="3 3" stroke={brand.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Bar dataKey="value" fill={brand.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-sm font-medium text-muted-foreground">{p.sickLeaveDurationClasses}</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationClassData}>
                <CartesianGrid strokeDasharray="3 3" stroke={brand.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Bar dataKey="value" fill={brand.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {sickLeaveHeatmapRows.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-sm font-medium text-muted-foreground">{p.sickLeaveByCity}</p>
          <div className="mt-3">
            <Heatmap rows={sickLeaveHeatmapRows} columns={[p.heatmapColumns.reports, p.heatmapColumns.sickDays]} data={sickLeaveHeatmapData} />
          </div>
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <p className="p-5 pb-0 text-sm font-medium text-muted-foreground">{p.leaderboardTitle}</p>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">{p.headers.rank}</th>
              <th className="p-4">{p.headers.employee}</th>
              <th className="p-4">{p.headers.score}</th>
              <th className="p-4">{p.headers.jobs}</th>
              <th className="p-4">{p.headers.rating}</th>
              <th className="p-4">{p.headers.complaints}</th>
              <th className="p-4">{p.headers.rework}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {kpis.qualityScore.employees.map((employee, index) => (
              <tr key={employee.staffId}>
                <td className="p-4 font-mono text-xs text-muted-foreground">{index + 1}</td>
                <td className="p-4 font-medium">{employee.fullName}</td>
                <td className="p-4">{employee.score}/100</td>
                <td className="p-4">{employee.completedJobs}</td>
                <td className="p-4">{employee.avgRating !== null ? `${employee.avgRating.toFixed(1)}★` : "Not available"}</td>
                <td className="p-4">{employee.complaints}</td>
                <td className="p-4">{employee.reworkRate !== null ? `${Math.round(employee.reworkRate * 100)}%` : "Not available"}</td>
              </tr>
            ))}
            {kpis.qualityScore.employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  {p.noDataForPeriod}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
