/**
 * Removes the seeded Operations Center demo dataset from PRODUCTION.
 *
 * Copy it to staging first with copy-demo-operations-to-staging.ts - this is
 * irreversible.
 *
 * Only demo rows are removed, identified by the email domains the seeder used
 * (@demo.dartahara.com for staff, @demo-customer.com for customers) plus the
 * office-scoped operational tables the seeder created wholesale. Real customers
 * and real staff are left untouched.
 *
 * PROTECTED below is a hard stop, not a comment: if a protected address ever
 * appears in the delete set the script aborts without writing anything.
 *
 * `offices` is deliberately kept. The four rows are real cities the business
 * operates in, and the dashboard and KPI pages need offices to exist.
 *
 *   npx tsx scripts/clear-demo-operations-data.ts             # dry run
 *   CLEAR_APPLY=1 npx tsx scripts/clear-demo-operations-data.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const PROD_REF = "sadyszicqxqslskotyta";
const APPLY = Boolean(process.env.CLEAR_APPLY);

/** Never deleted, under any circumstance. */
const PROTECTED = ["o.deraz@saasolution.es"];

const env: Record<string, string> = {};
for (const line of readFileSync(new URL("../.env.local.prod-backup", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) throw new Error("Missing production credentials.");
if (!url.includes(PROD_REF)) throw new Error(`Expected project ${PROD_REF}, got ${url}. Refusing.`);

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

type Row = Record<string, unknown>;

async function readAll(table: string): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select("*").range(from, from + 999);
    if (error) throw new Error(`read ${table}: ${JSON.stringify(error)}`);
    rows.push(...((data || []) as Row[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

async function deleteByIds(table: string, column: string, ids: string[]) {
  if (!ids.length || !APPLY) return;
  for (let i = 0; i < ids.length; i += 100) {
    const { error } = await db.from(table).delete().in(column, ids.slice(i, i + 100));
    if (error) throw new Error(`delete ${table}: ${JSON.stringify(error)}`);
  }
}

async function main() {
  console.log(APPLY ? "APPLYING deletion to PRODUCTION\n" : "DRY RUN (set CLEAR_APPLY=1 to delete)\n");

  const allStaff = await readAll("staff_members");
  const allCustomers = await readAll("customers");

  const staff = allStaff.filter((r) => String(r.email || "").includes("@demo.dartahara.com"));
  const customers = allCustomers.filter((r) => String(r.email || "").includes("@demo-customer.com"));

  // Hard stop. Nothing is written if a protected account is anywhere in scope.
  const doomedEmails = new Set([...staff, ...customers].map((r) => String(r.email || "").toLowerCase()));
  for (const address of PROTECTED) {
    if (doomedEmails.has(address.toLowerCase())) {
      throw new Error(`ABORT: protected account ${address} matched the delete set.`);
    }
  }

  const staffIds = staff.map((r) => r.id as string);
  const customerIds = customers.map((r) => r.id as string);
  const staffIdSet = new Set(staffIds);
  const customerIdSet = new Set(customerIds);

  const visits = (await readAll("service_visits")).filter((r) => customerIdSet.has(r.customer_id as string));
  const visitIds = visits.map((r) => r.id as string);
  const visitIdSet = new Set(visitIds);

  const inspections = (await readAll("quality_inspections")).filter((r) => visitIdSet.has(r.visit_id as string));
  const complaints = (await readAll("customer_complaints")).filter((r) => customerIdSet.has(r.customer_id as string));
  const liveStatus = (await readAll("staff_live_status")).filter((r) => staffIdSet.has(r.staff_id as string));
  const attendance = (await readAll("staff_attendance")).filter((r) => staffIdSet.has(r.staff_id as string));
  const sickLeave = (await readAll("staff_sick_leave")).filter((r) => staffIdSet.has(r.staff_id as string));
  const properties = (await readAll("properties")).filter((r) => customerIdSet.has(r.customer_id as string));
  const restock = await readAll("inventory_restock_requests");
  const inventory = await readAll("inventory_items");
  const insights = await readAll("ai_insights");

  const plan: Array<[string, string, string[]]> = [
    ["staff_live_status", "staff_id", liveStatus.map((r) => r.staff_id as string)],
    ["quality_inspections", "id", inspections.map((r) => r.id as string)],
    ["customer_complaints", "id", complaints.map((r) => r.id as string)],
    ["inventory_restock_requests", "id", restock.map((r) => r.id as string)],
    ["inventory_items", "id", inventory.map((r) => r.id as string)],
    ["ai_insights", "id", insights.map((r) => r.id as string)],
    ["staff_attendance", "id", attendance.map((r) => r.id as string)],
    ["staff_sick_leave", "id", sickLeave.map((r) => r.id as string)],
    ["service_visits", "id", visitIds],
    ["properties", "id", properties.map((r) => r.id as string)],
    ["customers", "id", customerIds],
    ["staff_members", "id", staffIds],
  ];

  for (const [table, column, ids] of plan) {
    console.log(`  ${table.padEnd(30)} ${String(ids.length).padStart(5)}`);
    await deleteByIds(table, column, ids);
  }

  const total = plan.reduce((sum, [, , ids]) => sum + ids.length, 0);
  console.log(`\n${APPLY ? "Deleted" : "Would delete"} ${total} rows.`);
  console.log(`Kept: ${allStaff.length - staff.length} staff, ${allCustomers.length - customers.length} customers, and all offices.`);
  console.log(`Protected and verified absent from the delete set: ${PROTECTED.join(", ")}`);
}

main().catch((error) => {
  console.error(`\nFailed: ${error.message}`);
  process.exit(1);
});
