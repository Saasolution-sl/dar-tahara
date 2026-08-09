"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { KpiScoreCard } from "@/components/kpi/KpiScoreCard";
import { brand, chartPalette } from "@/lib/dashboard/chartColors";
import type { BusinessKpis } from "@/lib/kpi";
import type { KpiCopy } from "@/i18n/kpi-copy";

export function BusinessKpiSection({ kpis, copy }: { kpis: BusinessKpis; copy: KpiCopy }) {
  const b = copy.business;
  const growthData = kpis.regionalGrowth.cities.map((c) => ({ name: c.city, net: c.netGrowth }));
  const complaintCategoryData = kpis.complaints.summary.categories;

  return (
    <section>
      <h2 className="font-serif text-2xl">{b.title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiScoreCard kpi={kpis.customerSatisfaction} copy={copy} />
        <KpiScoreCard kpi={kpis.complaints} copy={copy} />
        <KpiScoreCard kpi={kpis.quality} copy={copy} />
        <KpiScoreCard kpi={kpis.planningEfficiency} copy={copy} />
        <KpiScoreCard kpi={kpis.capacityUtilization} copy={copy} />
        <KpiScoreCard kpi={kpis.regionalGrowth} copy={copy} />
        <KpiScoreCard kpi={kpis.employeeFlowPerCity} copy={copy} />
        <KpiScoreCard kpi={kpis.operationalPerformance} copy={copy} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-sm font-medium text-muted-foreground">{b.netGrowthByCity}</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={brand.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Bar dataKey="net" fill={brand.primary} radius={[6, 6, 0, 0]} name={b.netGrowthByCity} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {kpis.regionalGrowth.cities.filter((c) => c.expansionOpportunity).map((c) => (
              <li key={c.officeId}>
                {b.expansionNote.replace("{city}", c.city).replace("{percent}", String(c.growthPercent))}
              </li>
            ))}
          </ul>
        </div>

        {complaintCategoryData.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="text-sm font-medium text-muted-foreground">{b.complaintCategories}</p>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={complaintCategoryData} dataKey="count" nameKey="category" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                    {complaintCategoryData.map((entry, index) => (
                      <Cell key={entry.category} fill={chartPalette[index % chartPalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <p className="p-5 pb-0 text-sm font-medium text-muted-foreground">{b.employeeFlowTitle}</p>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">{b.headers.city}</th>
              <th className="p-4">{b.headers.hired}</th>
              <th className="p-4">{b.headers.leaving}</th>
              <th className="p-4">{b.headers.active}</th>
              <th className="p-4">{b.headers.avgTenure}</th>
              <th className="p-4">{b.headers.turnover}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {kpis.employeeFlowPerCity.cities.map((city) => (
              <tr key={city.officeId}>
                <td className="p-4 font-medium">{city.city}</td>
                <td className="p-4">{city.hired}</td>
                <td className="p-4">{city.leaving}</td>
                <td className="p-4">{city.activeEmployees}</td>
                <td className="p-4">{city.avgEmploymentDurationDays !== null ? `${Math.round(city.avgEmploymentDurationDays)}d` : "Not available"}</td>
                <td className="p-4">{city.turnoverPercent !== null ? `${city.turnoverPercent}%` : "Not available"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
