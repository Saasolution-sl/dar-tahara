"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { StatCard } from "@/components/dashboard/StatCard";
import { chartPalette } from "@/lib/dashboard/chartColors";
import type { CustomerOverview as CustomerOverviewData } from "@/lib/dashboard/queries/customers";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

export function CustomerOverview({ data, copy }: { data: CustomerOverviewData; copy: DashboardCopy }) {
  const c = copy.customers;
  return (
    <section>
      <h2 className="font-serif text-2xl">{c.title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={c.active} value={data.activeCustomers} />
        <StatCard label={c.new30d} value={data.newCustomers30d} tone="success" />
        <StatCard label={c.lost30d} value={data.lostCustomers30d} tone={data.lostCustomers30d > 0 ? "critical" : "default"} />
        <StatCard label={c.retention} value={data.retentionPercent} suffix="%" />
        <StatCard label={c.waitingList} value={data.waitingList} />
        <StatCard label={c.avgRevenuePerCustomer} value={data.averageRevenuePerCustomerCents} format="currency" />
        <StatCard label={c.ltv} value={data.customerLifetimeValueCents} format="currency" />
      </div>

      {data.subscriptionTypeBreakdown.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-sm font-medium text-muted-foreground">{c.subscriptionTypes}</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.subscriptionTypeBreakdown} dataKey="count" nameKey="frequency" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                  {data.subscriptionTypeBreakdown.map((entry, index) => (
                    <Cell key={entry.frequency} fill={chartPalette[index % chartPalette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
