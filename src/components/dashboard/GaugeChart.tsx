"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { brand } from "@/lib/dashboard/chartColors";

export function GaugeChart({ value, max = 100, color = brand.accent, size = 96 }: { value: number; max?: number; color?: string; size?: number }) {
  const data = [{ name: "value", value }];
  return (
    <RadialBarChart
      width={size}
      height={size}
      innerRadius="70%"
      outerRadius="100%"
      barSize={8}
      data={data}
      startAngle={90}
      endAngle={-270}
    >
      <PolarAngleAxis type="number" domain={[0, max]} angleAxisId={0} tick={false} />
      <RadialBar background dataKey="value" cornerRadius={8} fill={color} isAnimationActive={false} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-sm font-semibold">
        {Math.round(value)}
      </text>
    </RadialBarChart>
  );
}
