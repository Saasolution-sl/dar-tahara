import * as React from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger index: multiplies the base delay. */
  index?: number;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "span";
}

/**
 * Server-rendered wrapper for content that previously used a runtime scroll
 * observer. Keeping it visible avoids delayed LCP and hydration work.
 */
export function Reveal({
  children,
  className,
  index: _index = 0,
  delay: _delay = 0,
  y: _y = 20,
  as = "div",
}: RevealProps) {
  const Tag = as;

  return (
    <Tag className={cn(className)}>
      {children}
    </Tag>
  );
}

/** Container that staggers direct Reveal children when they read `index`. */
export function RevealGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(className)}>{children}</div>;
}
