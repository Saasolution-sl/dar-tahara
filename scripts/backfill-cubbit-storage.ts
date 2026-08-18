/**
 * Copies existing support-request and pause-request attachments out of
 * Supabase Storage and into Cubbit, then repoints each row's storage_path /
 * storage_provider so the app serves the Cubbit copy going forward.
 *
 * Safe to re-run: only rows still marked storage_provider='supabase' are
 * touched, and rows with no storage_path (external_url-only support
 * attachments synced from HospitalitySupport) are skipped entirely - those
 * never lived in this app's storage.
 *
 * Defaults to a dry run (lists what would move, changes nothing). Pass
 * --apply to actually copy files and update rows.
 *
 *   npx tsx scripts/backfill-cubbit-storage.ts --env .env.local
 *   npx tsx scripts/backfill-cubbit-storage.ts --env .env.local --apply
 *   npx tsx scripts/backfill-cubbit-storage.ts --env .env.local.prod-backup --apply
 */
import { readFileSync } from "node:fs";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const env: Record<string, string> = {};
const envFlag = process.argv.indexOf("--env");
const envFile = envFlag !== -1 ? process.argv[envFlag + 1] : ".env.local";
const apply = process.argv.includes("--apply");

for (const line of readFileSync(new URL(`../${envFile}`, import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}

const supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
const cubbitEndpoint = env.CUBBIT_S3_ENDPOINT || "";
const cubbitRegion = env.CUBBIT_S3_REGION || "";
const cubbitBucket = env.CUBBIT_S3_BUCKET || "";
const cubbitAccessKeyId = env.CUBBIT_S3_ACCESS_KEY_ID || "";
const cubbitSecretAccessKey = env.CUBBIT_S3_SECRET_ACCESS_KEY || "";
if (!supabaseUrl || !supabaseKey) throw new Error(`Missing Supabase credentials in ${envFile}.`);
if (!cubbitEndpoint || !cubbitRegion || !cubbitBucket || !cubbitAccessKeyId || !cubbitSecretAccessKey) {
  throw new Error(`Missing Cubbit credentials in ${envFile}.`);
}

const s3 = new S3Client({
  endpoint: cubbitEndpoint,
  region: cubbitRegion,
  forcePathStyle: true,
  credentials: { accessKeyId: cubbitAccessKeyId, secretAccessKey: cubbitSecretAccessKey },
});

async function select<T>(path: string): Promise<T> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function patch(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: "PATCH",
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} -> ${res.status} ${await res.text()}`);
}

async function downloadFromSupabaseStorage(bucket: string, path: string): Promise<{ bytes: Buffer; contentType: string }> {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
  if (!res.ok) throw new Error(`storage download ${bucket}/${path} -> ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  return { bytes, contentType };
}

async function migrateTable(opts: {
  table: string;
  supabaseBucket: string;
  keyPrefix: string;
}): Promise<{ migrated: number; failed: number }> {
  type Row = { id: string; storage_path: string | null; mime_type: string };
  const rows = await select<Row[]>(
    `${opts.table}?storage_provider=eq.supabase&storage_path=not.is.null&select=id,storage_path,mime_type`,
  );
  console.log(`[${opts.table}] ${rows.length} row(s) still on Supabase Storage.`);

  let migrated = 0;
  let failed = 0;
  for (const row of rows) {
    const oldPath = row.storage_path as string;
    const newKey = `${opts.keyPrefix}/${oldPath}`;
    console.log(`${apply ? "MOVE" : "[dry run] would move"} ${opts.supabaseBucket}/${oldPath} -> cubbit:${newKey}`);
    if (!apply) continue;
    try {
      const { bytes, contentType } = await downloadFromSupabaseStorage(opts.supabaseBucket, oldPath);
      await s3.send(new PutObjectCommand({ Bucket: cubbitBucket, Key: newKey, Body: bytes, ContentType: row.mime_type || contentType }));
      await patch(`${opts.table}?id=eq.${row.id}`, { storage_path: newKey, storage_provider: "cubbit" });
      migrated += 1;
    } catch (err) {
      failed += 1;
      console.error(`  FAILED: ${row.id}: ${(err as Error).message}`);
    }
  }
  return { migrated, failed };
}

async function main() {
  console.log(`Env file: ${envFile}${apply ? " (APPLYING CHANGES)" : " (dry run only, pass --apply to write)"}`);
  const support = await migrateTable({ table: "support_attachments", supabaseBucket: "support-attachments", keyPrefix: "support-attachments" });
  const pause = await migrateTable({ table: "pause_request_attachments", supabaseBucket: "pause-request-attachments", keyPrefix: "pause-request-attachments" });
  console.log(`Done. support_attachments: ${support.migrated} migrated, ${support.failed} failed. pause_request_attachments: ${pause.migrated} migrated, ${pause.failed} failed.`);
  if (support.failed || pause.failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
