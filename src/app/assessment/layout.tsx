import type { ReactNode } from "react";
import { RoleWorkspaceShell } from "@/components/workspace/RoleWorkspaceShell";
import { requireRole } from "@/lib/portal-auth";
import { dashboardCopy } from "@/i18n/dashboard-copy";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata = { title: "Assessment workspace · Dar Tahara", robots: { index: false, follow: false } };

export default async function AssessmentLayout({ children }: { children: ReactNode }) {
  const context = await requireRole(["assessment"]);
  const locale = await getRequestLocale();
  const copy = dashboardCopy[locale];
  const w = copy.workspace;
  return (
    <RoleWorkspaceShell
      title={w.assessment.title}
      email={context.user.email || ""}
      locale={locale}
      signOutLabel={w.signOut}
      languageLabel={w.language}
      links={[{ href: "/assessment", label: w.assessment.nav.myAssessments }]}
    >
      {children}
    </RoleWorkspaceShell>
  );
}
