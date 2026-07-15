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

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLIC_KEY =
  process.env.SUPABASE_ANON_KEY ||
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

async function parseResponse<T>(res: Response, operation: string): Promise<T> {
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${operation}_failed_${res.status}:${detail.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
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
  const key = opts.useServiceRole ? SECRET_KEY : PUBLIC_KEY;
  if (!URL || !key) throw new Error(opts.useServiceRole ? "service_role_not_configured" : "supabase_not_configured");

  const res = await fetch(`${URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      ...requestHeaders(key),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  return parseResponse<T>(res, `rpc_${fn}`);
}

/** Service-role RPC used only by trusted webhook and maintenance routes. */
export async function serviceRpc<T = unknown>(
  fn: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  return callRpc<T>(fn, args, { useServiceRole: true });
}

/** Service-role REST GET against a table/view (admin only). */
export async function serviceSelect<T = unknown>(query: string): Promise<T> {
  if (!URL || !SECRET_KEY) throw new Error("service_role_not_configured");
  const res = await fetch(`${URL}/rest/v1/${query}`, {
    headers: requestHeaders(SECRET_KEY),
    cache: "no-store",
  });
  return parseResponse<T>(res, "select");
}


/** Insert rows with the server-only elevated key and return the inserted rows. */
export async function serviceInsert<T = unknown>(
  table: string,
  body: Record<string, unknown> | Array<Record<string, unknown>>,
): Promise<T> {
  if (!URL || !SECRET_KEY) throw new Error("service_role_not_configured");
  const res = await fetch(`${URL}/rest/v1/${table}?select=*`, {
    method: "POST",
    headers: {
      ...requestHeaders(SECRET_KEY),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return parseResponse<T>(res, `insert_${table}`);
}

/** Atomically insert-or-ignore by a unique constraint and return inserted rows. */
export async function serviceInsertIgnoreDuplicates<T = unknown>(
  table: string,
  body: Record<string, unknown> | Array<Record<string, unknown>>,
  onConflict: string,
): Promise<T> {
  if (!URL || !SECRET_KEY) throw new Error("service_role_not_configured");
  const res = await fetch(
    `${URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}&select=*`,
    {
      method: "POST",
      headers: {
        ...requestHeaders(SECRET_KEY),
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates,return=representation",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  return parseResponse<T>(res, `insert_${table}`);
}

/** Upsert rows by a named unique column and return the resulting rows. */
export async function serviceUpsert<T = unknown>(
  table: string,
  body: Record<string, unknown>,
  onConflict: string,
): Promise<T> {
  if (!URL || !SECRET_KEY) throw new Error("service_role_not_configured");
  const res = await fetch(
    `${URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}&select=*`,
    {
      method: "POST",
      headers: {
        ...requestHeaders(SECRET_KEY),
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  return parseResponse<T>(res, `upsert_${table}`);
}

/** Delete rows selected with a trusted, server-built PostgREST filter. */
export async function serviceDelete(table: string, filter: string): Promise<void> {
  if (!URL || !SECRET_KEY) throw new Error("service_role_not_configured");
  const res = await fetch(`${URL}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: requestHeaders(SECRET_KEY),
    cache: "no-store",
  });
  await parseResponse<void>(res, `delete_${table}`);
}

/** Patch rows selected with a trusted, server-built PostgREST filter. */
export async function serviceUpdate<T = unknown>(
  table: string,
  filter: string,
  body: Record<string, unknown>,
): Promise<T> {
  if (!URL || !SECRET_KEY) throw new Error("service_role_not_configured");
  const res = await fetch(`${URL}/rest/v1/${table}?${filter}&select=*`, {
    method: "PATCH",
    headers: {
      ...requestHeaders(SECRET_KEY),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return parseResponse<T>(res, `update_${table}`);
}
