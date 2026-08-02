import type { ReactNode } from "react";
import { RoleWorkspaceShell } from "@/components/workspace/RoleWorkspaceShell";
import { requireRole } from "@/lib/portal-auth";

export const metadata = { title: "Regional manager workspace · Dar Tahara", robots: { index: false, follow: false } };

export default async function RegionalManagerLayout({ children }: { children: ReactNode }) {
  const context = await requireRole(["regional_manager", "administrator"]);
  return (
    <RoleWorkspaceShell
      title="Regional manager"
      email={context.user.email || ""}
      links={[
        { href: "/regional-manager", label: "Overview" },
        { href: "/regional-manager/customers", label: "Customers" },
        { href: "/regional-manager/subscriptions", label: "Subscriptions" },
        { href: "/regional-manager/team", label: "Personnel" },
      ]}
    >
      {children}
    </RoleWorkspaceShell>
  );
}
