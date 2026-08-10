/**
 * Creates (or repairs) an administrator login on STAGING.
 *
 * Auth users live inside a Supabase project and do not travel with a table
 * copy, so an account that works in production does not exist in staging at
 * all. This grants a real admin the same access there.
 *
 * A pure admin: an auth user plus the `administrator` role. No `customers` row
 * is created - admin access comes from user_roles, and adding a customer row
 * would also make the account a portal customer, which is not what an operator
 * account is for.
 *
 * Staging only, and it refuses to run anywhere else: creating admin logins is
 * not something to do against production by accident.
 *
 *   $env:ADMIN_EMAIL="you@example.com"
 *   $env:ADMIN_PASSWORD="..."
 *   npx tsx scripts/create-staging-admin.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const STAGING_REF = "ehzrroohsmwdkebezhiy";

const env: Record<string, string> = {};
for (const line of readFileSync(new URL("../.env.local.staging-backup", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) throw new Error("Missing staging credentials in .env.local.staging-backup");
if (!url.includes(STAGING_REF)) throw new Error(`Expected staging (${STAGING_REF}), got ${url}. Refusing.`);

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD.");

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

async function main() {
  const { data: list, error: listError } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw new Error(`listUsers: ${listError.message}`);

  const existing = list.users.find((u) => u.email?.toLowerCase() === email!.toLowerCase());
  let userId: string;

  if (existing) {
    const { error } = await db.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`updateUser: ${error.message}`);
    userId = existing.id;
    console.log(`auth user: reused (${email})`);
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`createUser: ${error.message}`);
    userId = data.user.id;
    console.log(`auth user: created (${email})`);
  }

  const { error: roleError } = await db
    .from("user_roles")
    .upsert({ user_id: userId, role: "administrator" }, { onConflict: "user_id,role" });
  if (roleError) throw new Error(`user_roles: ${JSON.stringify(roleError)}`);

  const { data: roles } = await db.from("user_roles").select("role").eq("user_id", userId);
  console.log(`roles: ${(roles || []).map((r) => r.role).join(", ")}`);
  console.log("\nSign in at http://localhost:3200/login, then open /admin.");
}

main().catch((error) => {
  console.error(`\nFailed: ${error.message}`);
  process.exit(1);
});
