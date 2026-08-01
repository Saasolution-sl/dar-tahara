import * as React from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/seo/structured-data";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  /** Absolute path (e.g. `/en/missionandvision`). Omit for the current page. */
  href?: string;
}

/**
 * Accessible breadcrumb trail plus the matching BreadcrumbList JSON-LD.
 *
 * The separator is a direction-neutral slash so the trail reads correctly in
 * both LTR and RTL locales without mirroring an arrow glyph.
 */
export function Breadcrumbs({
  items,
  label = "Breadcrumb",
  className,
}: {
  items: Crumb[];
  label?: string;
  className?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${site.url}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <nav aria-label={label} className={cn("text-sm", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-x-2">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground" aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
                {isLast ? null : (
                  <span aria-hidden className="text-muted-foreground/50">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd id="breadcrumb-structured-data" data={jsonLd} />
    </>
  );
}
