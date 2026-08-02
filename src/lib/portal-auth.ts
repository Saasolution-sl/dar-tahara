import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { dashboardForRoles, safeNextPath } from "@/lib/portal-routing";

export { dashboardForRoles, safeNextPath } from "@/lib/portal-routing";

export type AppRole =
  | "applicant"
  | "customer"
  | "customer_company"
  | "staff"
  | "assessment"
  | "manager"
  | "regional_manager"
  | "administrator";

export type AuthContext = {
  user: User;
  roles: AppRole[];
  customerId: string | null;
  customerStatus: string | null;
  staffActive: boolean | null;
  officeIds: string[];
};

export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    const [{ data: roleRows }, { data: customer }, { data: staff }, { data: officeRows }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("customers").select("id,status").eq("auth_user_id", user.id).maybeSingle(),
      supabase.from("staff_members").select("active").eq("auth_user_id", user.id).maybeSingle(),
      supabase.from("regional_manager_offices").select("office_id").eq("user_id", user.id),
    ]);
    const roles = (roleRows || []).map((row) => row.role).filter(isAppRole);
    return {
      user,
      roles,
      customerId: customer?.id || null,
      customerStatus: customer?.status || null,
      staffActive: staff ? staff.active : null,
      officeIds: (officeRows || []).map((row) => row.office_id),
    };
  } catch {
    return null;
  }
}

function isAppRole(value: string): value is AppRole {
  return [
    "applicant",
    "customer",
    "customer_company",
    "staff",
    "assessment",
    "manager",
    "regional_manager",
    "administrator",
  ].includes(value);
}

/** A blocked customer or deactivated personnel account, regardless of role. */
export function isBlocked(context: AuthContext): boolean {
  return context.customerStatus === "suspended" || context.staffActive === false;
}

export async function requireAuth(next = "/account"): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) redirect(`/login?next=${encodeURIComponent(safeNextPath(next))}`);
  if (isBlocked(context)) redirect("/login?error=account_suspended");
  return context;
}

export async function requireRole(allowed: readonly AppRole[]): Promise<AuthContext> {
  const context = await requireAuth();
  if (!context.roles.some((role) => allowed.includes(role))) redirect(dashboardForRoles(context.roles));
  return context;
}

export async function authorizeApi(allowed?: readonly AppRole[]) {
  const context = await getAuthContext();
  if (!context) return { ok: false as const, status: 401 as const, error: "unauthorized" };
  if (isBlocked(context)) return { ok: false as const, status: 403 as const, error: "account_suspended" };
  if (allowed && !context.roles.some((role) => allowed.includes(role))) {
    return { ok: false as const, status: 403 as const, error: "forbidden" };
  }
  return { ok: true as const, context };
}
