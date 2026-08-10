/**
 * READ-ONLY probe: is 20260810101033_simplify_early_access_funnel.sql applied
 * to production?
 *
 * Writes nothing. Each check is a `select ... limit 0` (or a deliberately
 * invalid-value filter) whose *error text* tells us whether a column or
 * constraint exists. Run before deciding to push the migration, so we know
 * whether it landed fully, partially, or not at all.
 *
 *   npx tsx scripts/probe-early-access-migration.ts
 */
import { readFileSync } from "node:fs";

const env: Record<string, string> = {};
for (const line of readFileSync(new URL("../.env.local.prod-backup", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) throw new Error("Missing production credentials.");

async function get(path: string): Promise<{ status: number; body: string }> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return { status: res.status, body: (await res.text()).slice(0, 200) };
}

/** A column check: selecting a missing column makes PostgREST 400 with its name. */
async function columnExists(table: string, column: string): Promise<boolean> {
  const { status } = await get(`${table}?select=${column}&limit=0`);
  return status === 200;
}

async function main() {
  console.log(`Project: ${url}\n`);

  console.log("Columns added by the migration:");
  for (const [table, column] of [
    ["early_access_signup_sessions", "city"],
    ["early_access_signup_sessions", "early_access_registered_at"],
    ["early_access_signup_sessions", "onboarding_started_at"],
    ["early_access_signup_sessions", "onboarding_completed_at"],
  ] as const) {
    const ok = await columnExists(table, column);
    console.log(`  ${ok ? "PRESENT" : "MISSING"}  ${table}.${column}`);
  }

  console.log("\nView created by the migration:");
  const view = await get("early_access_funnel_step_stats?select=step_id&limit=0");
  console.log(`  ${view.status === 200 ? "PRESENT" : "MISSING"}  early_access_funnel_step_stats (HTTP ${view.status})`);

  // The CHECK constraint can only be observed directly by attempting a write,
  // which this read-only probe will not do. It travels with the columns above:
  // `supabase db push` runs each migration file in one transaction, so the
  // constraint is applied if and only if the columns are. Confirm with
  // `supabase migration list --linked` (remote column populated) rather than
  // trusting a line printed here.
  console.log("\nlead_consents_consent_type_check:");
  console.log("  Not probed - same transaction as the columns above.");

  console.log("\nRow counts (unchanged by this probe):");
  for (const table of ["marketing_leads", "lead_consents", "early_access_signup_sessions"]) {
    const res = await fetch(`${url}/rest/v1/${table}?select=id`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact", Range: "0-0" },
    });
    console.log(`  ${table.padEnd(30)} ${res.headers.get("content-range") || "?"}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
