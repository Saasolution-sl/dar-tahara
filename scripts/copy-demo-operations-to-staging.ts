/**
 * Copies the seeded Operations Center demo dataset from production to staging,
 * so there is something to develop against once production is cleaned.
 *
 * Only the demo rows are copied. Real customers and real staff stay in
 * production: moving actual people's personal data into a test environment is
 * the kind of thing that causes a data-protection problem later, and it is not
 * needed - the demo set is what the dashboard was built against.
 *
 * Demo rows are identifiable by the email domains the seeder used:
 *   staff_members  -> @demo.dartahara.com
 *   customers      -> @demo-customer.com
 * Everything else is reached from those two, by foreign key.
 *
 * UUIDs are preserved so relationships survive the copy.
 *
 * Reads production credentials from .env.local.prod-backup and staging
 * credentials from .env.local.staging-backup, so it does not care which
 * environment .env.local happens to point at.
 *
 *   npx tsx scripts/copy-demo-operations-to-staging.ts          # dry run
 *   COPY_APPLY=1 npx tsx scripts/copy-demo-operations-to-staging.ts
 */
import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PROD_REF = "sadyszicqxqslskotyta";
const STAGING_REF = "ehzrroohsmwdkebezhiy";
const APPLY = Boolean(process.env.COPY_APPLY);
const CHUNK = 200;

function readEnvFile(relative: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(new URL(relative, import.meta.url), "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function clientFor(envFile: string, expectedRef: string, label: string): SupabaseClient {
  const env = readEnvFile(envFile);
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error(`${label}: missing url/key in ${envFile}`);
  if (!url.includes(expectedRef)) {
    throw new Error(`${label}: ${envFile} points at ${url}, expected project ${expectedRef}. Refusing.`);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

const prod = clientFor("../.env.local.prod-backup", PROD_REF, "production");
const staging = clientFor("../.env.local.staging-backup", STAGING_REF, "staging");

type Row = Record<string, unknown>;

async function readAll(db: SupabaseClient, table: string, filter?: (q: never) => never): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    let query = db.from(table).select("*").range(from, from + 999);
    if (filter) query = filter(query as never);
    const { data, error } = await query;
    if (error) throw new Error(`read ${table}: ${JSON.stringify(error)}`);
    rows.push(...((data || []) as Row[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

async function write(table: string, rows: Row[], conflictKey: string) {
  if (!rows.length) return;
  if (!APPLY) return;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await staging
      .from(table)
      .upsert(rows.slice(i, i + CHUNK), { onConflict: conflictKey, ignoreDuplicates: true });
    if (error) throw new Error(`write ${table}: ${JSON.stringify(error)}`);
  }
}

async function main() {
  console.log(APPLY ? "APPLYING copy -> staging\n" : "DRY RUN (set COPY_APPLY=1 to write)\n");

  const offices = await readAll(prod, "offices");
  const allStaff = await readAll(prod, "staff_members");
  const allCustomers = await readAll(prod, "customers");

  const staff = allStaff.filter((r) => String(r.email || "").includes("@demo.dartahara.com"));
  const customers = allCustomers.filter((r) => String(r.email || "").includes("@demo-customer.com"));
  const staffIds = new Set(staff.map((r) => r.id as string));
  const customerIds = new Set(customers.map((r) => r.id as string));

  const allProperties = await readAll(prod, "properties");
  const properties = allProperties.filter((r) => customerIds.has(r.customer_id as string));
  const propertyIds = new Set(properties.map((r) => r.id as string));

  const allVisits = await readAll(prod, "service_visits");
  const visits = allVisits.filter(
    (r) => customerIds.has(r.customer_id as string) || propertyIds.has(r.property_id as string),
  );
  const visitIds = new Set(visits.map((r) => r.id as string));

  const inspections = (await readAll(prod, "quality_inspections")).filter((r) =>
    visitIds.has(r.visit_id as string),
  );
  const complaints = (await readAll(prod, "customer_complaints")).filter((r) =>
    customerIds.has(r.customer_id as string),
  );
  const liveStatus = (await readAll(prod, "staff_live_status")).filter((r) =>
    staffIds.has(r.staff_id as string),
  );
  const inventory = await readAll(prod, "inventory_items");
  const inventoryIds = new Set(inventory.map((r) => r.id as string));
  const restock = (await readAll(prod, "inventory_restock_requests")).filter((r) =>
    inventoryIds.has(r.item_id as string),
  );
  const insights = await readAll(prod, "ai_insights");
  const attendance = (await readAll(prod, "staff_attendance")).filter((r) =>
    staffIds.has(r.staff_id as string),
  );
  const sickLeave = (await readAll(prod, "staff_sick_leave")).filter((r) =>
    staffIds.has(r.staff_id as string),
  );

  // Insert order follows the foreign keys.
  const plan: Array<[string, Row[], string]> = [
    ["offices", offices, "id"],
    ["staff_members", staff, "id"],
    ["customers", customers, "id"],
    ["properties", properties, "id"],
    ["service_visits", visits, "id"],
    ["quality_inspections", inspections, "id"],
    ["customer_complaints", complaints, "id"],
    ["staff_live_status", liveStatus, "staff_id"],
    ["inventory_items", inventory, "id"],
    ["inventory_restock_requests", restock, "id"],
    ["ai_insights", insights, "id"],
    ["staff_attendance", attendance, "id"],
    ["staff_sick_leave", sickLeave, "id"],
  ];

  for (const [table, rows, key] of plan) {
    console.log(`  ${table.padEnd(30)} ${String(rows.length).padStart(5)}`);
    await write(table, rows, key);
  }

  const total = plan.reduce((sum, [, rows]) => sum + rows.length, 0);
  console.log(`\n${APPLY ? "Copied" : "Would copy"} ${total} rows.`);
  console.log(
    `Excluded from the copy: ${allStaff.length - staff.length} real staff, ` +
      `${allCustomers.length - customers.length} real customers and their records.`,
  );
}

main().catch((error) => {
  console.error(`\nFailed: ${error.message}`);
  process.exit(1);
});
