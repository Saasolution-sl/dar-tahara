export const brand = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
};

/** Semantic visit-status colors, distinct from brand tones so status stays legible in both themes. */
export const statusColor: Record<string, string> = {
  completed: "#22c55e",
  working: "#f59e0b",
  driving: "#3b82f6",
  break: "#a78bfa",
  waiting: "#94a3b8",
  scheduled: "#94a3b8",
  finished: "#22c55e",
  delayed: "#ef4444",
  cancelled: "#9ca3af",
  sick: "#ef4444",
  offline: "#9ca3af",
};

export const severityColor: Record<string, string> = {
  info: "#3b82f6",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export const chartPalette = ["#2f5233", "#c99a3c", "#3b82f6", "#22c55e", "#a78bfa", "#ef4444"];
