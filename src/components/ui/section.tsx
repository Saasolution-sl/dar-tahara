import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div";
  bleed?: boolean;
}

/** Vertical rhythm wrapper for page sections. */
export function Section({
  className,
  as: Tag = "section",
  bleed = false,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn("py-20 sm:py-28 lg:py-32", bleed && "overflow-hidden", className)}
      {...props}
    />
  );
}

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container", className)} {...props} />;
}

interface HeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** Consistent section header: eyebrow + display title + supporting copy. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: HeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center mx-auto max-w-2xl",
        align === "left" && "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? (
        <span className="eyebrow">
          <span className="h-px w-6 bg-accent/60" aria-hidden />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-display-md text-foreground">{title}</h2>
      {subtitle ? (
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
