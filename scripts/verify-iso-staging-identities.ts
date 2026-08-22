import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { privilegedSessionNeedsStepUp } from "../src/lib/mfa-policy";

const STAGING_PROJECT_REF = "ehzrroohsmwdkebezhiy";
const PREFIX = "iso.security.staff.";
const url = process.env.SUPABASE_URL || "";
const secret = process.env.SUPABASE_SECRET_KEY || "";
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

if (!url || !secret || !publishable) throw new Error("Missing staging Supabase credentials.");
if (!url.includes(STAGING_PROJECT_REF)) {
  throw new Error(`Refusing to run against a project other than ${STAGING_PROJECT_REF}.`);
}

const options = {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
};
const admin = createClient(url, secret, options);
const stamp = `${Date.now()}.${randomBytes(8).toString("hex")}`;
const email = `${PREFIX}${stamp}@example.com`;
const password = `Iso-Staging-${stamp}-Aa1!`;
const employeeNumber = `ISO-STG-${Date.now()}`;
const checks: string[] = [];
let userId: string | null = null;
let staffId: string | null = null;

function check(condition: boolean, label: string) {
  if (!condition) throw new Error(label);
  checks.push(label);
}

async function main() {
  try {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { iso_security_test: true, intended_role: "staff" },
      user_metadata: { invited_profile: "assessment", synthetic: true },
    });
    if (created.error || !created.data.user) throw created.error || new Error("user creation failed");
    userId = created.data.user.id;
    checks.push("synthetic staff auth identity created");

    const role = await admin.from("user_roles").upsert(
      { user_id: userId, role: "staff" },
      { onConflict: "user_id,role" },
    );
    if (role.error) throw role.error;

    const profile = await admin.from("staff_members").insert({
      auth_user_id: userId,
      full_name: "ISO Security Test Staff",
      email,
      role: "cleaner",
      employee_number: employeeNumber,
      active: true,
    }).select("id").single();
    if (profile.error || !profile.data) throw profile.error || new Error("staff profile creation failed");
    staffId = profile.data.id;
    checks.push("least-privilege staff profile linked");

    const client = createClient(url, publishable, options);
    const signedIn = await client.auth.signInWithPassword({ email, password });
    if (signedIn.error || !signedIn.data.session) throw signedIn.error || new Error("staff sign-in failed");
    checks.push("staff authentication succeeded");

    const roles = await client.from("user_roles").select("role");
    check(!roles.error && roles.data?.length === 1 && roles.data[0].role === "staff", "own staff role isolated");

    const ownProfile = await client.from("staff_members").select("id,employee_number,active").eq("id", staffId).single();
    check(!ownProfile.error && ownProfile.data?.employee_number === employeeNumber, "own non-sensitive staff fields readable");

    const privateFields = await client.from("staff_members").select("email,phone,auth_user_id").eq("id", staffId);
    check(Boolean(privateFields.error), "private staff fields blocked");

    const escalation = await client.from("user_roles").insert({ user_id: userId, role: "administrator" });
    check(Boolean(escalation.error), "staff role escalation blocked");

    const customer = await admin.from("customers").select("id").eq("auth_user_id", userId);
    check(!customer.error && customer.data?.length === 0, "staff identity not provisioned as customer");

    check(
      privilegedSessionNeedsStepUp(["staff"], "aal1", { NODE_ENV: "production" }),
      "privileged staff AAL1 requires MFA step-up",
    );
    await client.auth.signOut();

    console.log(JSON.stringify({
      status: "PASS",
      project: STAGING_PROJECT_REF,
      identity: "synthetic_staff",
      checks,
    }, null, 2));
  } finally {
    if (staffId) await admin.from("staff_members").delete().eq("id", staffId);
    if (userId) await admin.auth.admin.deleteUser(userId);
    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const orphanCount = (listed.data?.users || []).filter((user) => user.email?.startsWith(PREFIX)).length;
    console.error(JSON.stringify({ cleanup: orphanCount === 0 ? "PASS" : "FAILED", orphanCount }));
    if (orphanCount) process.exitCode = 1;
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "ISO staging identity verification failed");
  process.exitCode = 1;
});
