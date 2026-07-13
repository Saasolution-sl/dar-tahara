import "server-only";

/**
 * Tiny server-side Supabase REST client (no SDK dependency).
 *
 * - Public writes go through SECURITY DEFINER RPCs with the publishable/anon
 *   key. RLS blocks all direct table access, so this key can never read the list.
 * - Admin reads use the secret/service-role key (server-only env), never shipped
 *   to the client. The app works with just the public key; the elevated key
 *   unlocks admin export + double opt-in email token lookup.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Opaque `sb_publishable_` / `sb_secret_` keys belong only in `apikey`.
 * Legacy anon/service-role keys are JWTs and must also be sent as Bearer auth.
 */
function requestHeaders(key: string): Record<string, string> {
  return {
    apikey: key,
    ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
  };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(URL && PUBLIC_KEY);
}

export function isServiceRoleConfigured(): boolean {
  return Boolean(URL && SECRET_KEY);
}

type RpcOptions = { useServiceRole?: boolean };

export async function callRpc<T = unknown>(
  fn: string,
  args: Record<string, unknown>,
  opts: RpcOptions = {},
): Promise<T> {
  if (!URL || !PUBLIC_KEY) throw new Error("supabase_not_configured");
  const key = opts.useServiceRole && SECRET_KEY ? SECRET_KEY : PUBLIC_KEY;

  const res = await fetch(`${URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      ...requestHeaders(key),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`rpc_${fn}_failed_${res.status}:${detail.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Service-role REST GET against a table/view (admin only). */
export async function serviceSelect<T = unknown>(query: string): Promise<T> {
  if (!URL || !SECRET_KEY) throw new Error("service_role_not_configured");
  const res = await fetch(`${URL}/rest/v1/${query}`, {
    headers: requestHeaders(SECRET_KEY),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`select_failed_${res.status}:${detail.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}
