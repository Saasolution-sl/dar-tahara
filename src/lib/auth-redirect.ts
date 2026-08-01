import { safeNextPath } from "@/lib/portal-routing";

export type AuthEntryPoint = "login" | "signup";

export function buildAuthCallbackUrl(
  origin: string,
  next: string | null | undefined,
  from: AuthEntryPoint,
): string {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", safeNextPath(next));
  url.searchParams.set("from", from);
  return url.toString();
}

export function buildAuthErrorUrl(
  origin: string,
  next: string | null | undefined,
  from: string | null | undefined,
): URL {
  const entryPoint: AuthEntryPoint = from === "signup" ? "signup" : "login";
  const url = new URL(`/${entryPoint}`, origin);
  url.searchParams.set("error", "oauth");
  url.searchParams.set("next", safeNextPath(next));
  return url;
}
