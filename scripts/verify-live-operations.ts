/**
 * Proves the Live operations board and the "right now" tiles agree.
 *
 * Runs the exact PostgREST queries the dashboard now issues and asserts the
 * relationship the bug violated: the tile counts must sum to the number of
 * cards the board renders.
 *
 *   npx tsx scripts/verify-live-operations.ts
 */
import { readFileSync } from "node:fs";
import { countLiveStatuses, LIVE_STATUSES, ALL_STAFF_STATUSES } from "../src/lib/dashboard/liveStatus";

const env: Record<string, string> = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) throw new Error("Missing Supabase credentials in .env.local.");

async function select<T>(path: string): Promise<T> {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`${path} -> ${response.status} ${await response.text()}`);
  return response.json() as Promise<T>;
}

async function main() {
  console.log(`Project: ${url}\n`);

  const all = await select<Array<{ status: string }>>("staff_live_status?select=status");
  const counts = countLiveStatuses(all);

  // What the board actually fetches now.
  const board = await select<Array<{ staff_id: string; status: string }>>(
    `staff_live_status?select=staff_id,status&status=in.(${LIVE_STATUSES.join(",")})`,
  );

  console.log("staff_live_status rows in total:", all.length);
  for (const status of ALL_STAFF_STATUSES) console.log(`  ${status.padEnd(9)} ${counts[status]}`);

  console.log("\nTiles (right now):");
  console.log("  Working          ", counts.working);
  console.log("  Driving          ", counts.driving);
  console.log("  On break         ", counts.break);
  console.log("  Waiting          ", counts.waiting);
  console.log("  Finished         ", counts.finished);
  console.log("  Employees working", counts.onShift, "(working + driving)");

  console.log("\nBoard renders:", board.length, "cards");

  const tileSum = counts.working + counts.driving + counts.break + counts.waiting;
  const ok = tileSum === board.length && board.length === counts.live;
  console.log(
    `\n${ok ? "OK" : "MISMATCH"}: working+driving+break+waiting = ${tileSum}, board cards = ${board.length}`,
  );
  console.log(`Excluded from the board: ${all.length - board.length} (finished/sick/offline)`);

  // Each tile's drill-down link must return exactly the number on the tile.
  console.log("\nDrill-down links:");
  for (const status of ALL_STAFF_STATUSES) {
    const rows = await select<unknown[]>(`staff_live_status?select=staff_id&status=eq.${status}`);
    const match = rows.length === counts[status] ? "ok" : "MISMATCH";
    console.log(`  /admin/live-operations?status=${status.padEnd(9)} -> ${rows.length} rows (${match})`);
  }

  if (!ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
