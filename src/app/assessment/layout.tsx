import type { ReactNode } from "react";
import { RoleWorkspaceShell } from "@/components/workspace/RoleWorkspaceShell";
import { requireRole } from "@/lib/portal-auth";

export const metadata = { title: "Assessment workspace · Dar Tahara", robots: { index: false, follow: false } };

export default async function AssessmentLayout({ children }: { children: ReactNode }) {
  const context = await requireRole(["assessment"]);
  return (
    <RoleWorkspaceShell
      title="Assessment workspace"
      email={context.user.email || ""}
      links={[{ href: "/assessment", label: "My assessments" }]}
    >
      {children}
    </RoleWorkspaceShell>
  );
}
