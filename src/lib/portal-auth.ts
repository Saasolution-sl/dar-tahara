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
  | "administrator";

export type AuthContext = {
  user: User;
  roles: AppRole[];
  customerId: string | null;
  customerStatus: string | null;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    const [{ data: roleRows }, { data: customer }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("customers").select("id,status").eq("auth_user_id", user.id).maybeSingle(),
    ]);
    const roles = (roleRows || []).map((row) => row.role).filter(isAppRole);
    return {
      user,
      roles,
      customerId: customer?.id || null,
      customerStatus: customer?.status || null,
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
    "administrator",
  ].includes(value);
}

export async function requireAuth(next = "/account"): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) redirect(`/login?next=${encodeURIComponent(safeNextPath(next))}`);
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
  if (allowed && !context.roles.some((role) => allowed.includes(role))) {
    return { ok: false as const, status: 403 as const, error: "forbidden" };
  }
  return { ok: true as const, context };
}
