import { AbandonmentFeedback } from "@/components/early-access/abandonment-feedback";

export const metadata = { title: "Early Access feedback · Dar Tahara", robots: { index: false, follow: false } };

export default async function EarlyAccessFeedbackPage({ searchParams }: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  return <main className="container max-w-2xl py-16">
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[.18em] text-accent">Dar Tahara Early Access</p>
      <h1 className="mt-3 text-3xl font-semibold">Help us improve the signup</h1>
      <p className="mt-3 mb-8 text-muted-foreground">This is optional. Please do not include sensitive information.</p>
      <AbandonmentFeedback initialReason={params.reason} />
    </div>
  </main>;
}
