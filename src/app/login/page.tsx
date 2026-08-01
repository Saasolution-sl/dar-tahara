import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-form";
import { portalCopy } from "@/i18n/portal-copy";
import { getRequestLocale } from "@/lib/request-locale";
import { dashboardForRoles, getAuthContext, safeNextPath } from "@/lib/portal-auth";

export const metadata = { title: "Login · Dar Tahara", robots: { index: false, follow: false } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const existing = await getAuthContext();
  if (existing) redirect(dashboardForRoles(existing.roles));
  const locale = await getRequestLocale(); const copy = portalCopy[locale].auth;
  const params = await searchParams;
  const next = safeNextPath(params.next);
  return <AuthShell title={copy.login}><LoginForm copy={copy} next={next} oauthError={params.error === "oauth"} /></AuthShell>;
}
