/**
 * Remove specific test leads from production.
 *
 * DRY RUN BY DEFAULT. Prints exactly what it would delete and changes nothing.
 * Pass --confirm to actually delete.
 *
 *   npx tsx scripts/delete-test-leads.ts             # show what would go
 *   npx tsx scripts/delete-test-leads.ts --confirm   # actually delete
 *
 * Two tables need handling, not one:
 *
 *   marketing_leads            - children cascade (lead_consents,
 *                                email_verification_tokens, billing_profiles,
 *                                cleaning_properties, lead_service_preferences,
 *                                referral_events), so one delete is enough.
 *   early_access_signup_sessions - does NOT cascade. Its lead_id is
 *                                `on delete set null` and it carries its own
 *                                email column, so deleting the lead alone would
 *                                leave the session row behind with the address
 *                                still in it, still counted in funnel stats.
 *
 * Mautic is NOT touched. Sessions carry a `mautic_contact_id`; any found are
 * printed so they can be removed from Mautic separately. Deleting here does not
 * delete there.
 */
import { readFileSync } from "node:fs";

/** Test addresses to remove. Everything else is left alone. */
const TEST_EMAILS = [
  "slsaasolution@gmail.com",
  "paradoxpartition@gmail.com",
  "othman.deraz@gmail.com",
].map((e) => e.toLowerCase());

const confirm = process.argv.includes("--confirm");

const env: Record<string, string> = {};
for (const line of readFileSync(new URL("../.env.local.prod-backup", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) throw new Error("Missing production credentials.");

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const inList = `(${TEST_EMAILS.map((e) => `"${e}"`).join(",")})`;

async function get<T>(path: string): Promise<T[]> {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T[];
}

async function del<T>(path: string): Promise<T[]> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=representation" },
  });
  if (!res.ok) throw new Error(`DELETE ${path} -> ${res.status} ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as T[];
}

type Lead = { id: string; email: string; created_at: string; status: string | null };
type Session = {
  id: string;
  email: string | null;
  normalized_email: string | null;
  mautic_contact_id: number | null;
  status: string;
  created_at: string;
};

async function main() {
  console.log(`Project: ${url}`);
  console.log(`Mode:    ${confirm ? "*** DELETING ***" : "dry run (nothing will change)"}\n`);
  console.log(`Targets: ${TEST_EMAILS.join(", ")}\n`);

  const leads = await get<Lead>(`marketing_leads?select=id,email,created_at,status&email=in.${inList}`);
  const sessions = await get<Session>(
    `early_access_signup_sessions?select=id,email,normalized_email,mautic_contact_id,status,created_at&or=(email.in.${inList},normalized_email.in.${inList})`,
  );

  console.log(`marketing_leads matched: ${leads.length}`);
  for (const l of leads) console.log(`  ${l.created_at.slice(0, 19)}  ${l.email}  (${l.status ?? "-"})`);

  // Counts of what cascade will take with them, so the blast radius is visible
  // before anything is removed rather than inferred afterwards.
  if (leads.length) {
    const ids = `(${leads.map((l) => `"${l.id}"`).join(",")})`;
    for (const table of [
      "lead_consents",
      "email_verification_tokens",
      "billing_profiles",
      "cleaning_properties",
      "lead_service_preferences",
    ]) {
      try {
        const child = await get<{ id: string }>(`${table}?select=id&lead_id=in.${ids}`);
        console.log(`  └─ ${table}: ${child.length} row(s) will cascade`);
      } catch {
        console.log(`  └─ ${table}: could not count (table may not exist)`);
      }
    }
  }

  console.log(`\nearly_access_signup_sessions matched: ${sessions.length}  (these do NOT cascade)`);
  for (const s of sessions) {
    console.log(
      `  ${s.created_at.slice(0, 19)}  ${s.email ?? s.normalized_email ?? "-"}  ${s.status}` +
        (s.mautic_contact_id ? `  mautic=${s.mautic_contact_id}` : ""),
    );
  }

  const mautic = sessions.map((s) => s.mautic_contact_id).filter((v): v is number => v != null);
  if (mautic.length) {
    console.log(`\nMautic contact IDs referenced: ${[...new Set(mautic)].join(", ")}`);
    console.log("This script does NOT delete from Mautic. Remove them there separately.");
  }

  if (!confirm) {
    console.log("\nDry run complete. Nothing was changed. Re-run with --confirm to delete.");
    return;
  }

  console.log("\nDeleting...");
  const goneSessions = await del<{ id: string }>(
    `early_access_signup_sessions?or=(email.in.${inList},normalized_email.in.${inList})`,
  );
  console.log(`  early_access_signup_sessions: ${goneSessions.length} deleted`);

  const goneLeads = await del<Lead>(`marketing_leads?email=in.${inList}`);
  console.log(`  marketing_leads: ${goneLeads.length} deleted (children cascaded)`);

  const remainingLeads = await get<Lead>("marketing_leads?select=id,email,created_at&order=created_at.asc");
  const remainingSessions = await get<{ id: string }>("early_access_signup_sessions?select=id");
  console.log(`\nRemaining: ${remainingLeads.length} lead(s), ${remainingSessions.length} session(s).`);
  for (const l of remainingLeads) console.log(`  ${l.created_at.slice(0, 19)}  ${l.email}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
