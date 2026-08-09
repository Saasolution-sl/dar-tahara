import "server-only";

import type { AuthContext, AppRole } from "@/lib/portal-auth";

export type DashboardRole = "administrator" | "regional_manager" | "manager";

export type DashboardScope = {
  role: DashboardRole;
  /** null = unrestricted (administrator, manager). Non-null = filter to these offices. */
  officeIds: string[] | null;
};

/** Highest-privilege dashboard role wins: administrator > regional_manager > manager. */
export function getDashboardScope(context: AuthContext): DashboardScope | null {
  const role = highestDashboardRole(context.roles);
  if (!role) return null;
  if (role === "administrator" || role === "manager") return { role, officeIds: null };
  return { role: "regional_manager", officeIds: context.officeIds };
}

function highestDashboardRole(roles: readonly AppRole[]): DashboardRole | null {
  if (roles.includes("administrator")) return "administrator";
  if (roles.includes("regional_manager")) return "regional_manager";
  if (roles.includes("manager")) return "manager";
  return null;
}

/** PostgREST `in.(...)` filter fragment for an office-scoped query, or "" when unrestricted. */
export function officeFilter(scope: DashboardScope, column = "office_id"): string {
  if (scope.officeIds === null) return "";
  if (scope.officeIds.length === 0) return `&${column}=in.(00000000-0000-0000-0000-000000000000)`;
  return `&${column}=in.(${scope.officeIds.join(",")})`;
}

/**
 * Same as officeFilter, but for a `!inner`-joined embedded resource column
 * (e.g. `path = "service_visits.office_id"` after selecting
 * `...,service_visits!inner(office_id)`). A plain embedded filter only trims
 * the nested object for a to-one relation, `!inner` is required for it to
 * actually exclude the parent row.
 */
export function embeddedOfficeFilter(scope: DashboardScope, path: string): string {
  if (scope.officeIds === null) return "";
  if (scope.officeIds.length === 0) return `&${path}=in.(00000000-0000-0000-0000-000000000000)`;
  return `&${path}=in.(${scope.officeIds.join(",")})`;
}
