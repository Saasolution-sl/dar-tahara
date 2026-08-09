"use client";

import * as React from "react";
import { animate } from "framer-motion";
import { money } from "@/lib/portal-format";

export type NumberFormatKind = "integer" | "rating" | "currency";

function formatValue(value: number, kind: NumberFormatKind): string {
  if (kind === "rating") return value.toFixed(1);
  if (kind === "currency") return money(Math.round(value));
  return Math.round(value).toLocaleString();
}

/**
 * `format` is a string enum, not a function: function props can't cross the
 * server/client boundary (this component is rendered from plain Server
 * Component sections like KpiOverview.tsx), so formatting logic lives here.
 */
export function AnimatedNumber({ value, format = "integer" }: { value: number; format?: NumberFormatKind }) {
  const [display, setDisplay] = React.useState(0);
  const previous = React.useRef(0);

  React.useEffect(() => {
    const controls = animate(previous.current, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value]);

  return <>{formatValue(display, format)}</>;
}
