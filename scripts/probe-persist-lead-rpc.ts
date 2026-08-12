/**
 * READ-ONLY probe: is 20260810214500_atomic_early_access_lead.sql applied to
 * production?
 *
 * That migration creates public.persist_early_access_lead(). `lead-persistence.ts`
 * calls it with no fallback, so if the function is missing while the code is
 * deployed, every early-access signup fails. This is the check that
 * probe-early-access-migration.ts does NOT do - that one covers the earlier
 * funnel migration (columns + view), which can be fully applied while this one
 * is not.
 *
 * Writes nothing and invokes nothing. It reads PostgREST's OpenAPI document,
 * which enumerates the RPCs exposed on the schema, so there is no possibility
 * of creating a lead as a side effect of asking.
 *
 *   npx tsx scripts/probe-persist-lead-rpc.ts                       # production
 *   npx tsx scripts/probe-persist-lead-rpc.ts --env .env.local      # staging
 *
 * The environment is selectable because staging drifting behind production is
 * itself a failure mode: on 2026-08-11 production had the function and staging
 * did not, so local development hit a 500 that production no longer had. A
 * probe that can only see one environment cannot tell you that.
 */
import { readFileSync } from "node:fs";

const envFlag = process.argv.indexOf("--env");
const envFile = envFlag !== -1 ? process.argv[envFlag + 1] : ".env.local.prod-backup";

const env: Record<string, string> = {};
for (const line of readFileSync(new URL(`../${envFile}`, import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) throw new Error("Missing production credentials.");

const TARGET = "persist_early_access_lead";

async function main() {
  console.log(`Project: ${url}\n`);

  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/openapi+json" },
  });

  if (!res.ok) {
    console.log(`Could not read the schema document (HTTP ${res.status}).`);
    process.exitCode = 1;
    return;
  }

  const spec = (await res.json()) as { paths?: Record<string, unknown> };
  const rpcs = Object.keys(spec.paths || {})
    .filter((p) => p.startsWith("/rpc/"))
    .map((p) => p.slice(5))
    .sort();

  const present = rpcs.includes(TARGET);

  console.log("Function created by the migration:");
  console.log(`  ${present ? "PRESENT" : "*** MISSING ***"}  public.${TARGET}()`);

  const related = rpcs.filter((r) => /early_access|lead|consent/.test(r));
  console.log(`\nRelated RPCs exposed (${related.length}):`);
  for (const r of related) console.log(`  ${r}`);
  console.log(`\nTotal RPCs on the schema: ${rpcs.length}`);

  // `--all` prints the full list so two environments can be diffed. A count
  // difference tells you drift exists; only the names tell you what drifted.
  if (process.argv.includes("--all")) {
    console.log("\nAll RPCs:");
    for (const r of rpcs) console.log(`  ${r}`);
  }

  if (!present) {
    console.log(
      "\nEarly-access signup calls this function with no fallback, so signups are" +
        "\nfailing while the deployed code expects it. Apply with:" +
        "\n\n  supabase db push --linked\n",
    );
    process.exitCode = 1;
  } else {
    console.log("\nMigration is applied. Early-access lead capture has its function.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
