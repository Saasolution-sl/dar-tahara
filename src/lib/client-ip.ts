import { isIP } from "node:net";

function validIp(value: string | undefined): string | null {
  if (!value) return null;
  const candidate = value.trim();
  return isIP(candidate) ? candidate.toLowerCase() : null;
}

/**
 * Client IP supplied by the trusted reverse proxy.
 *
 * Caddy appends the peer address to X-Forwarded-For. Selecting from the right
 * prevents a caller-controlled left-most value from bypassing rate limits.
 * Set TRUSTED_PROXY_HOPS only when the production proxy chain is deliberately
 * changed and verified.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const hops = Math.max(1, Number.parseInt(process.env.TRUSTED_PROXY_HOPS || "1", 10) || 1);
  const chain = (headers.get("x-forwarded-for") || "")
    .split(",")
    .map((value) => validIp(value))
    .filter((value): value is string => Boolean(value));
  return chain.at(-hops) || "unknown";
}
