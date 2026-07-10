import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo. The official artwork lives at /public/logo.png (do not redesign).
 * - `full`      renders the official logo image (hero/footer/brand moments)
 * - `wordmark`  renders a crisp typographic lockup for tight UI (navbar)
 */
export function Logo({
  variant = "wordmark",
  className,
  invert = false,
}: {
  variant?: "full" | "wordmark";
  className?: string;
  invert?: boolean;
}) {
  if (variant === "full") {
    return (
      <Image
        src="/logo.png"
        alt="Dar Tahara — House of Purity"
        width={320}
        height={320}
        priority
        className={cn("h-auto w-auto object-contain", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-serif leading-none",
        className,
      )}
    >
      <DomeMark
        className={cn(
          "h-7 w-7 shrink-0",
          invert ? "text-stone-50" : "text-primary",
        )}
      />
      <span className="flex flex-col">
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            invert ? "text-stone-50" : "text-foreground",
          )}
        >
          Dar Tahara
        </span>
        <span className="text-[0.58rem] font-sans font-medium uppercase tracking-widest text-accent">
          House of Purity
        </span>
      </span>
    </span>
  );
}

/**
 * A minimal dome-arch mark echoing the logo's silhouette — used only as a
 * compact UI glyph and favicon, never as a replacement for the full logo.
 */
export function DomeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 3c6.5 7.2 12 12.8 12 21.5C36 34.3 30.6 41 24 41S12 34.3 12 24.5C12 15.8 17.5 10.2 24 3Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M18 28.5v-6.2l6-4.8 6 4.8v6.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 28.5v-3.2h4v3.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
