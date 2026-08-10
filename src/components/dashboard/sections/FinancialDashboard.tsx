"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { StatCard } from "@/components/dashboard/StatCard";
import { money } from "@/lib/portal-format";
import { brand } from "@/lib/dashboard/chartColors";
import type { FinancialDashboard as FinancialDashboardData } from "@/lib/dashboard/queries/financial";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

export function FinancialDashboard({ data, copy }: { data: FinancialDashboardData; copy: DashboardCopy }) {
  const c = copy.financial;
  return (
    <section>
      <h2 className="font-serif text-2xl">{c.title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={c.monthlyRevenue} value={data.monthlyRevenueCents} format="currency" trend={data.revenueGrowthPercent !== null ? { value: data.revenueGrowthPercent, label: c.vsLastMonth } : null} href="/admin/invoices" />
        <StatCard label={c.mrr} value={data.mrrCents} format="currency" href="/admin/subscriptions" />
        <StatCard label={c.outstandingPayments} value={data.outstandingPaymentsCents} format="currency" tone={data.outstandingPaymentsCents > 0 ? "warning" : "default"} href="/admin/invoices" />
        <StatCard label={c.revenuePerEmployee} value={data.revenuePerEmployeeCents} format="currency" href="/admin/team" />
        <StatCard label={c.revenuePerCustomer} value={data.revenuePerCustomerCents} format="currency" href="/admin/customers" />
        <StatCard label={c.projectedNextMonth} value={data.projectedNextMonthCents} format="currency" href="/admin/subscriptions" />
      </div>

      {data.revenuePerOffice.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-sm font-medium text-muted-foreground">{c.revenueByRegion}</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenuePerOffice.map((row) => ({ name: row.officeName, revenue: row.revenueCents / 100 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={brand.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip formatter={(value) => money(Math.round(Number(value) * 100))} />
                <Bar dataKey="revenue" fill={brand.primary} radius={[6, 6, 0, 0]} name={c.revenueSeries} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
