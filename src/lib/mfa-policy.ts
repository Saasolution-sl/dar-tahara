import type { AppRole } from "@/lib/portal-auth";

type Environment = Readonly<Record<string, string | undefined>>;

export const PRIVILEGED_ROLES: readonly AppRole[] = [
  "staff",
  "assessment",
  "manager",
  "regional_manager",
  "administrator",
];

export function hasPrivilegedRole(roles: readonly AppRole[]): boolean {
  return roles.some((role) => PRIVILEGED_ROLES.includes(role));
}

export function privilegedMfaEnforced(environment: Environment = process.env): boolean {
  if (environment.REQUIRE_PRIVILEGED_AAL2 === "true") return true;
  if (environment.REQUIRE_PRIVILEGED_AAL2 === "false") return false;
  return environment.NODE_ENV === "production";
}

export function privilegedSessionNeedsStepUp(
  roles: readonly AppRole[],
  aal: string | null,
  environment: Environment = process.env,
): boolean {
  return privilegedMfaEnforced(environment) && hasPrivilegedRole(roles) && aal !== "aal2";
}
