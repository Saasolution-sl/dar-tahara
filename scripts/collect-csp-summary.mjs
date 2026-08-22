import { readFile } from "node:fs/promises";

const envPath = process.argv[2] || ".env.local";
const values = {};
for (const rawLine of (await readFile(envPath, "utf8")).split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#") || !line.includes("=")) continue;
  const separator = line.indexOf("=");
  const key = line.slice(0, separator);
  let value = line.slice(separator + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
  values[key] = value;
}

const url = values.SUPABASE_URL || values.NEXT_PUBLIC_SUPABASE_URL;
const key = values.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error(`Supabase URL or secret key is missing from ${envPath}`);

const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
const endpoint = new URL("/rest/v1/security_event_log", url);
endpoint.searchParams.set("select", "occurred_at,metadata");
endpoint.searchParams.set("event_type", "eq.csp_violation");
endpoint.searchParams.set("occurred_at", `gte.${since}`);
endpoint.searchParams.set("order", "occurred_at.asc");
endpoint.searchParams.set("limit", "1000");

const response = await fetch(endpoint, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
  signal: AbortSignal.timeout(15_000),
});
if (!response.ok) throw new Error(`CSP summary query failed with status ${response.status}`);
const rows = await response.json();
const groups = new Map();
for (const row of rows) {
  const metadata = row.metadata || {};
  const groupKey = [
    metadata.route_class || "unknown",
    metadata.document_origin || "unknown",
    metadata.blocked_origin || "unknown",
    metadata.effective_directive || "unknown",
    metadata.violated_directive || "unknown",
    metadata.disposition || "unknown",
  ].join(" | ");
  groups.set(groupKey, (groups.get(groupKey) || 0) + 1);
}

console.log(JSON.stringify({
  project: new URL(url).hostname.split(".")[0],
  windowDays: 7,
  totalReports: rows.length,
  firstReport: rows[0]?.occurred_at || null,
  lastReport: rows.at(-1)?.occurred_at || null,
  groups: [...groups.entries()].map(([routeAndDirectives, count]) => ({ routeAndDirectives, count })),
}, null, 2));
