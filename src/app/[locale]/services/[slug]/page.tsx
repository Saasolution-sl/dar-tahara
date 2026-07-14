import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { isLocale, type Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { servicePageSlugs, servicePages, isServicePageSlug } from "@/lib/service-pages";
import { sections, whatsappLink } from "@/lib/site";
import { Container } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";

export function generateStaticParams() {
  return locales.flatMap((locale) => servicePageSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isServicePageSlug(slug)) return {};
  const page = servicePages[slug];
  return {
    title: page.eyebrow,
    description: page.summary,
    alternates: { canonical: `/${locale}/services/${slug}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isServicePageSlug(slug)) notFound();

  const typedLocale = locale as Locale;
  const dict = await getDictionary(typedLocale);
  const page = servicePages[slug];
  const base = `/${typedLocale}`;

  return (
    <article className="pb-24 pt-32 sm:pt-40">
      <Container>
        <div className="mx-auto max-w-5xl">
          <Link
            href={`${base}#${sections.services}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {dict.nav.services}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
            <div>
              <span className="eyebrow">{page.eyebrow}</span>
              <h1 className="mt-4 text-display-md text-foreground">{page.title}</h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{page.summary}</p>
              <p className="mt-6 leading-relaxed text-muted-foreground">{page.intro}</p>

              <div className="mt-10 space-y-8">
                {page.sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="font-serif text-2xl text-foreground">{section.title}</h2>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
                  </section>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-[2rem] border border-border bg-card p-6 shadow-soft">
              <h2 className="font-serif text-2xl text-foreground">{dict.brand.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {dict.booking.subtitle}
              </p>
              <ul className="mt-6 space-y-3">
                {page.highlights.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 grid gap-3">
                <Link href={`${base}#${sections.calculator}`} className={buttonVariants({ variant: "primary", size: "lg" })}>
                  {dict.calculator.cta.book}
                </Link>
                <Link
                  href={whatsappLink(`Hello Dar Tahara, I would like to learn more about ${page.eyebrow}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  <MessageCircle className="h-4 w-4" />
                  {dict.cta.whatsapp}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </article>
  );
}
