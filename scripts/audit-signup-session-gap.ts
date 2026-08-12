/**
 * READ-ONLY: when did people start signing up, and when did that stop turning
 * into leads?
 *
 * `audit-lead-consents.ts` answers "are any leads missing their consent rows".
 * This answers the different question raised on 2026-08-11: 39 signup sessions
 * exist while the newest lead is ten days old. Sessions and leads are written by
 * different paths, so that divergence is either a broken funnel or genuinely
 * poor conversion, and the timestamps tell you which.
 *
 * Buckets sessions by day alongside leads created the same day. A day with
 * sessions and no leads is a day the funnel was not converting; a run of them
 * that lines up with a deploy is an outage window.
 *
 * Writes nothing.
 *
 *   npx tsx scripts/audit-signup-session-gap.ts
 */
import { readFileSync } from "node:fs";

// Environment selectable, matching the other audit scripts.
const envFlag = process.argv.indexOf("--env");
const envFileName = envFlag !== -1 ? process.argv[envFlag + 1] : ".env.local.prod-backup";

const env: Record<string, string> = {};
for (const line of readFileSync(new URL(`../${envFileName}`, import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) throw new Error("Missing production credentials.");

async function rows<T>(path: string): Promise<T[]> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T[];
}

const day = (iso: string | null) => (iso ? iso.slice(0, 10) : "unknown");

async function main() {
  console.log(`Project: ${url}\n`);

  const sessions = await rows<{ created_at: string; early_access_registered_at: string | null }>(
    "early_access_signup_sessions?select=created_at,early_access_registered_at&order=created_at.asc",
  );
  const leads = await rows<{ created_at: string }>(
    "marketing_leads?select=created_at&order=created_at.asc",
  );

  const byDay = new Map<string, { sessions: number; registered: number; leads: number }>();
  const bucket = (d: string) => {
    if (!byDay.has(d)) byDay.set(d, { sessions: 0, registered: 0, leads: 0 });
    return byDay.get(d)!;
  };
  for (const s of sessions) {
    bucket(day(s.created_at)).sessions += 1;
    if (s.early_access_registered_at) bucket(day(s.early_access_registered_at)).registered += 1;
  }
  for (const l of leads) bucket(day(l.created_at)).leads += 1;

  console.log("day          sessions  registered  leads");
  for (const d of [...byDay.keys()].sort()) {
    const v = byDay.get(d)!;
    const flag = v.sessions > 0 && v.leads === 0 ? "   <- sessions but no lead" : "";
    console.log(
      `${d}   ${String(v.sessions).padStart(6)}  ${String(v.registered).padStart(10)}  ${String(v.leads).padStart(5)}${flag}`,
    );
  }

  const totalSessions = sessions.length;
  const totalLeads = leads.length;
  console.log(
    `\n${totalSessions} sessions, ${totalLeads} leads. Newest session ${day(sessions.at(-1)?.created_at ?? null)}, newest lead ${day(leads.at(-1)?.created_at ?? null)}.`,
  );
  console.log(
    "A day with sessions and no leads is the funnel not converting. Several in a row\n" +
      "ending at a deploy is an outage window; scattered ones are ordinary drop-off.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
