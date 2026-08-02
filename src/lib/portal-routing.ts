export type RoutableRole =
  | "applicant"
  | "customer"
  | "customer_company"
  | "staff"
  | "assessment"
  | "manager"
  | "regional_manager"
  | "administrator";

export function dashboardForRoles(roles: readonly RoutableRole[]): string {
  if (roles.includes("administrator")) return "/admin";
  if (roles.includes("regional_manager")) return "/regional-manager";
  if (roles.includes("manager")) return "/manager";
  if (roles.includes("assessment")) return "/assessment";
  if (roles.includes("staff")) return "/admin/assessments";
  if (roles.includes("customer") || roles.includes("customer_company")) return "/account";
  return "/account/assessments";
}

export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/account";
  return value;
}
