import type { ReactNode } from "react";
import { RoleWorkspaceShell } from "@/components/workspace/RoleWorkspaceShell";
import { requireRole } from "@/lib/portal-auth";

export const metadata = { title: "Manager workspace · Dar Tahara", robots: { index: false, follow: false } };

export default async function ManagerLayout({ children }: { children: ReactNode }) {
  const context = await requireRole(["manager", "administrator"]);
  return (
    <RoleWorkspaceShell
      title="Manager workspace"
      email={context.user.email || ""}
      links={[
        { href: "/manager", label: "Operations review" },
        { href: "/manager/refunds", label: "Refund confirmation" },
      ]}
    >
      {children}
    </RoleWorkspaceShell>
  );
}
