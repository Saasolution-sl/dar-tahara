import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import { DomeMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SubscribeUnsubscribedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const dict = await getDictionary(typedLocale);
  const m = dict.mailing;
  const ok = status === "unsubscribed";

  return (
    <section className="flex min-h-[70vh] items-center py-32">
      <Container>
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <DomeMark className="h-12 w-12 text-accent" />
          <h1 className="mt-6 font-serif text-3xl text-foreground">
            {ok ? m.unsubscribedTitle : m.invalidTitle}
          </h1>
          <p className="mt-3 text-muted-foreground">{ok ? m.unsubscribedBody : m.invalidBody}</p>
          <Link href={`/${typedLocale}`} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-8")}>
            {m.backHome}
          </Link>
        </div>
      </Container>
    </section>
  );
}
