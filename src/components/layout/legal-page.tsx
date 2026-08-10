import * as React from "react";
import { Languages } from "lucide-react";
import { Container } from "@/components/ui/section";
import { Breadcrumbs, type Crumb } from "@/components/seo/breadcrumbs";

export function LegalPage({
  title,
  updated,
  breadcrumbs,
  bindingLanguageNotice,
  children,
}: {
  title: string;
  updated: string;
  breadcrumbs?: Crumb[];
  /**
   * Prevailing-language clause, shown on translated versions only.
   *
   * Placed above the document rather than buried at the foot of it: its whole
   * purpose is that a customer cannot later say they understood the agreement
   * differently, and a notice they had to scroll past the entire contract to
   * reach would undercut exactly that.
   */
  bindingLanguageNotice?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="pb-24 pt-32 sm:pt-40">
      <Container>
        <div className="mx-auto max-w-3xl">
          {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="mb-8" /> : null}
          <span className="eyebrow">Dar Tahara</span>
          <h1 className="mt-4 text-display-md text-foreground">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{updated}</p>
          {bindingLanguageNotice ? (
            <aside
              className="mt-6 flex items-start gap-3 rounded-[1.25rem] border border-accent/30 bg-accent/[0.06] p-4 sm:p-5"
              aria-label={title}
            >
              <Languages className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <p className="text-sm leading-relaxed text-foreground">{bindingLanguageNotice}</p>
            </aside>
          ) : null}
          <div className="mt-10 space-y-6 text-[0.95rem] leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-foreground [&_strong]:text-foreground">
            {children}
          </div>
        </div>
      </Container>
    </article>
  );
}
