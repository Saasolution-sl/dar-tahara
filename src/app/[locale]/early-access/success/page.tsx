import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { isLocale, getDir, type Locale } from "@/i18n/config";
import { getEarlyAccessCopy } from "@/i18n/early-access-copy";
import { ReferralTools } from "@/components/early-access/referral-tools";
import { ResendForm } from "@/components/early-access/resend-form";
import { Container } from "@/components/ui/section";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
// Success/verification landings must never be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Status = "verified" | "already" | "pending" | "expired" | "invalid";

function resolveStatus(v: string | undefined): Status {
  return v === "verified" || v === "already" || v === "expired" || v === "invalid" ? v : "pending";
}

export default async function EarlyAccessSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; ref?: string }>;
}) {
  const { locale } = await params;
  const { status: statusRaw, ref } = await searchParams;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const copy = getEarlyAccessCopy(typedLocale);
  const dir = getDir(typedLocale);
  const status = resolveStatus(statusRaw);
  const s = copy.success;

  const view = {
    verified: { icon: CheckCircle2, tone: "text-primary", title: s.verifiedTitle, body: s.verifiedBody },
    already: { icon: CheckCircle2, tone: "text-primary", title: s.alreadyTitle, body: s.verifiedBody },
    pending: { icon: Clock, tone: "text-accent", title: s.pendingTitle, body: s.pendingBody },
    expired: { icon: AlertTriangle, tone: "text-accent", title: s.expiredTitle, body: s.expiredBody },
    invalid: { icon: AlertTriangle, tone: "text-accent", title: s.invalidTitle, body: s.invalidBody },
  }[status];

  const Icon = view.icon;
  const showReferral = (status === "verified" || status === "already") && Boolean(ref);
  const showResend = status === "pending" || status === "expired" || status === "invalid";

  return (
    <div dir={dir}>
      <section className="wash border-b border-border py-28 sm:py-32">
        <Container>
          <div className="mx-auto max-w-xl rounded-[2rem] border border-border bg-card p-8 text-center shadow-soft sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Icon className={`h-8 w-8 ${view.tone}`} />
            </div>
            <h1 className="mt-6 text-3xl text-foreground">{view.title}</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{view.body}</p>

            {showResend ? <ResendForm locale={typedLocale} copy={copy} /> : null}
            {showReferral && ref ? (
              <ReferralTools locale={typedLocale} copy={copy} referralCode={ref} baseUrl={site.url} />
            ) : null}

            <Link
              href={`/${typedLocale}`}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
            >
              {s.home}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
