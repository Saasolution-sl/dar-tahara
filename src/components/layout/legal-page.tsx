import * as React from "react";
import { Container } from "@/components/ui/section";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="pb-24 pt-32 sm:pt-40">
      <Container>
        <div className="mx-auto max-w-3xl">
          <span className="eyebrow">Dar Tahara</span>
          <h1 className="mt-4 text-display-md text-foreground">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{updated}</p>
          <div className="mt-10 space-y-6 text-[0.95rem] leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-foreground [&_strong]:text-foreground">
            {children}
          </div>
        </div>
      </Container>
    </article>
  );
}
