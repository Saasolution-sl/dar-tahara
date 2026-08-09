import type { ReactNode } from "react";
import { RoleWorkspaceShell } from "@/components/workspace/RoleWorkspaceShell";
import { requireRole } from "@/lib/portal-auth";
import { dashboardCopy } from "@/i18n/dashboard-copy";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata = { title: "Manager workspace · Dar Tahara", robots: { index: false, follow: false } };

export default async function ManagerLayout({ children }: { children: ReactNode }) {
  const context = await requireRole(["manager", "administrator"]);
  const locale = await getRequestLocale();
  const copy = dashboardCopy[locale];
  const w = copy.workspace;
  return (
    <RoleWorkspaceShell
      title={w.manager.title}
      email={context.user.email || ""}
      locale={locale}
      signOutLabel={w.signOut}
      languageLabel={w.language}
      links={[
        { href: "/manager", label: w.manager.nav.dashboard },
        { href: "/manager/kpis", label: w.manager.nav.kpis },
        { href: "/manager/assessment-review", label: w.manager.nav.assessmentReview },
        { href: "/manager/refunds", label: w.manager.nav.refunds },
        { href: "/manager/customers", label: w.manager.nav.customers },
        { href: "/manager/subscriptions", label: w.manager.nav.subscriptions },
        { href: "/manager/team", label: w.manager.nav.team },
      ]}
    >
      {children}
    </RoleWorkspaceShell>
  );
}
