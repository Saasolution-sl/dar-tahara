import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/auth-form";
import { portalCopy } from "@/i18n/portal-copy";
import { featureEnabled } from "@/lib/feature-flags";
import { getRequestLocale } from "@/lib/request-locale";
import { dashboardForRoles, getAuthContext, safeNextPath } from "@/lib/portal-auth";

export const metadata = { title: "Create account · Dar Tahara", robots: { index: false, follow: false } };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const existing = await getAuthContext();
  if (existing) redirect(dashboardForRoles(existing.roles));
  const locale = await getRequestLocale();
  const copy = portalCopy[locale].auth;
  const params = await searchParams;
  const next = safeNextPath(params.next);
  if (!await featureEnabled("customer_registration_enabled")) {
    return <AuthShell title={copy.createAccount} intro={copy.registrationUnavailable}><Link href="/login" className="mt-7 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">{copy.backToLogin}</Link></AuthShell>;
  }
  return <AuthShell title={copy.createAccount} intro={copy.signupIntro}><SignupForm copy={copy} next={next} locale={locale} oauthError={params.error === "oauth"} /></AuthShell>;
}
