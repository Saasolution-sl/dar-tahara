import type { ReactNode } from "react";
import { RoleWorkspaceShell } from "@/components/workspace/RoleWorkspaceShell";
import { requireRole } from "@/lib/portal-auth";
import { dashboardCopy } from "@/i18n/dashboard-copy";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata = { title: "Regional manager workspace · Dar Tahara", robots: { index: false, follow: false } };

export default async function RegionalManagerLayout({ children }: { children: ReactNode }) {
  const context = await requireRole(["regional_manager", "administrator"]);
  const locale = await getRequestLocale();
  const copy = dashboardCopy[locale];
  const w = copy.workspace;
  return (
    <RoleWorkspaceShell
      title={w.regionalManager.title}
      email={context.user.email || ""}
      locale={locale}
      signOutLabel={w.signOut}
      languageLabel={w.language}
      links={[
        { href: "/regional-manager", label: w.regionalManager.nav.dashboard },
        { href: "/regional-manager/kpis", label: w.regionalManager.nav.kpis },
        { href: "/regional-manager/customers", label: w.regionalManager.nav.customers },
        { href: "/regional-manager/subscriptions", label: w.regionalManager.nav.subscriptions },
        { href: "/regional-manager/team", label: w.regionalManager.nav.team },
      ]}
    >
      {children}
    </RoleWorkspaceShell>
  );
}
