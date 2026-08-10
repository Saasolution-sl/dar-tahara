"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { StatCard } from "@/components/dashboard/StatCard";
import { brand } from "@/lib/dashboard/chartColors";
import type { QualityCenter as QualityCenterData } from "@/lib/dashboard/queries/quality";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

export function QualityCenter({ data, copy }: { data: QualityCenterData; copy: DashboardCopy }) {
  const c = copy.quality;
  return (
    <section>
      <h2 className="font-serif text-2xl">{c.title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={c.inspectionScore} value={data.avgInspectionScore} suffix="/100" />
        <StatCard label={c.customerRating} value={data.avgCustomerRating} format="rating" suffix="★" />
        <StatCard label={c.firstTimeRight} value={data.firstTimeRightPercent} suffix="%" />
        <StatCard label={c.revisitRate} value={data.revisitPercent} suffix="%" tone={data.revisitPercent && data.revisitPercent > 10 ? "warning" : "default"} />
        <StatCard label={c.openComplaints} value={data.pendingComplaints} tone={data.pendingComplaints > 0 ? "warning" : "default"} href="/admin/complaints?status=pending" />
        <StatCard label={c.resolvedComplaints} value={data.resolvedComplaints} tone="success" href="/admin/complaints?status=resolved" />
        <StatCard label={c.recurringComplaints} value={data.recurringComplaints} tone={data.recurringComplaints > 0 ? "critical" : "default"} href="/admin/complaints?recurring=1" />
        <StatCard label={c.totalComplaints} value={data.totalComplaints} href="/admin/complaints" />
      </div>
      {data.ratingTrend.length > 1 ? (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-sm font-medium text-muted-foreground">{c.ratingTrend}</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.ratingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={brand.border} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(d))} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Line type="monotone" dataKey="avgRating" stroke={brand.primary} strokeWidth={2} dot={{ r: 3 }} name={c.avgRatingSeries} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
