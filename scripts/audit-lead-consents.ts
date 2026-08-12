/**
 * READ-ONLY audit: production leads that have no consent record.
 *
 * While migration 20260810101033 was missing, POST /api/early-access/lead
 * inserted the `marketing_leads` row first and then failed on `lead_consents`
 * (CHECK 23514). Any lead captured in that window is stored without the consent
 * it was collected under - a data-integrity problem and an awkward one to hold
 * under GDPR. This lists them so the decision to backfill or delete is made on
 * facts. It writes nothing.
 *
 *   npx tsx scripts/audit-lead-consents.ts
 */
import { readFileSync } from "node:fs";

const env: Record<string, string> = {};
// Environment is selectable so the same audit can check staging after a smoke
// test, not only production. Defaults to production so existing usage is
// unchanged.  --env .env.local  targets staging.
const envFlag = process.argv.indexOf("--env");
const envFile = envFlag !== -1 ? process.argv[envFlag + 1] : ".env.local.prod-backup";

for (const line of readFileSync(new URL(`../${envFile}`, import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) throw new Error("Missing production credentials.");

type Lead = { id: string; email: string | null; status: string | null; created_at: string };
type Consent = { lead_id: string; consent_type: string };

async function select<T>(path: string): Promise<T> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function main() {
  console.log(`Project: ${url}\n`);

  const [leads, consents] = await Promise.all([
    select<Lead[]>("marketing_leads?select=id,email,status,created_at&order=created_at.desc"),
    select<Consent[]>("lead_consents?select=lead_id,consent_type"),
  ]);

  const byLead = new Map<string, string[]>();
  for (const consent of consents) {
    byLead.set(consent.lead_id, [...(byLead.get(consent.lead_id) || []), consent.consent_type]);
  }

  const orphans: Lead[] = [];
  console.log(`${"created".padEnd(21)} ${"email".padEnd(30)} ${"status".padEnd(12)} consents`);
  for (const lead of leads) {
    const types = byLead.get(lead.id) || [];
    if (types.length === 0) orphans.push(lead);
    console.log(
      `${lead.created_at.slice(0, 19).replace("T", " ").padEnd(21)} ` +
        `${(lead.email || "?").padEnd(30)} ${(lead.status || "").padEnd(12)} ` +
        `${types.length ? types.sort().join(", ") : "*** NONE ***"}`,
    );
  }

  console.log(`\n${leads.length} leads, ${consents.length} consent rows, ${orphans.length} lead(s) with no consent.`);
  if (orphans.length) {
    console.log("\nLeads missing consent (captured while the migration was absent):");
    for (const lead of orphans) console.log(`  ${lead.id}  ${lead.email}  ${lead.created_at}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
