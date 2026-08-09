"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import { brand } from "@/lib/dashboard/chartColors";

export function Sparkline({ data, color = brand.primary }: { data: Array<{ value: number }>; color?: string }) {
  if (data.length < 2) return null;
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
