import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const STAGING_PROJECT_REF = "ehzrroohsmwdkebezhiy";

type TestUser = {
  key: "a" | "b";
  email: string;
  expectedRoles: Array<"applicant" | "customer_company">;
  id?: string;
  customerId?: string;
  client?: SupabaseClient;
};

const url = process.env.SUPABASE_URL || "";
const secret = process.env.SUPABASE_SECRET_KEY || "";
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

if (!url || !secret || !publishable) {
  throw new Error("Missing staging Supabase credentials.");
}
if (!url.includes(STAGING_PROJECT_REF)) {
  throw new Error(`Refusing to run against a project other than ${STAGING_PROJECT_REF}.`);
}

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};
const admin = createClient(url, secret, clientOptions);
const stamp = `${Date.now()}.${randomBytes(8).toString("hex")}`;
const password = `Codex-Bundle2-${stamp}-Aa1!`;
const users: TestUser[] = [
  { key: "a", email: `bundle2.rls.${stamp}.a@example.com`, expectedRoles: ["applicant"] },
  {
    key: "b",
    email: `bundle2.rls.${stamp}.b@example.com`,
    expectedRoles: ["applicant", "customer_company"],
  },
];
const activeClients: SupabaseClient[] = [];
const checks: string[] = [];

function assertCheck(condition: boolean, name: string, detail = "") {
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ""}`);
  checks.push(name);
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const candidate = error as Record<string, unknown>;
    return JSON.stringify({
      code: candidate.code,
      status: candidate.status,
      message: candidate.message,
      details: candidate.details,
      hint: candidate.hint,
    });
  }
  return String(error || "Bundle 2 staging verification failed.");
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function main() {
try {
  for (const user of users) {
    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: `Bundle 2 RLS ${user.key.toUpperCase()}` },
    });
    if (error || !data.user) {
      throw new Error(
        `create ${user.key}: ${error?.status || ""} ${error?.code || ""} ${error?.message || "no user"}`,
      );
    }
    user.id = data.user.id;
  }

  let customerRows: Array<{ id: string; auth_user_id: string }> = [];
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await admin
      .from("customers")
      .select("id,auth_user_id")
      .in("auth_user_id", users.map((user) => user.id!));
    if (error) throw error;
    customerRows = data || [];
    if (customerRows.length === 2) break;
    await wait(500);
  }
  assertCheck(
    customerRows.length === 2,
    "confirmed-user provisioning",
    `expected 2 customers, got ${customerRows.length}`,
  );
  for (const user of users) {
    user.customerId = customerRows.find((row) => row.auth_user_id === user.id)?.id;
    assertCheck(Boolean(user.customerId), `customer link ${user.key}`);
  }

  const companyUser = users.find((user) => user.key === "b")!;
  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: companyUser.id!, role: "customer_company" });
  if (roleError) throw roleError;

  const { error: companyError } = await admin.from("company_profiles").insert({
    customer_id: companyUser.customerId!,
    legal_name: "Bundle 2 Isolation BV",
    chamber_of_commerce_number: `B2${Date.now()}`,
    tax_identification_number: `NL${Date.now()}B01`,
    registration_country: "NL",
    registered_address: { line1: "Staging only", city: "Amsterdam", country: "NL" },
    billing_email: companyUser.email,
    billing_phone: "+31000000000",
    authorized_representative_name: "Bundle Two",
    authorized_representative_title: "Test",
  });
  if (companyError) throw companyError;

  for (const user of users) {
    const client = createClient(url, publishable, clientOptions);
    const { data, error } = await client.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (error || !data.session) {
      throw new Error(`signin ${user.key}: ${error?.message || "no session"}`);
    }
    activeClients.push(client);
    user.client = client;
  }

  for (const user of users) {
    const other = users.find((candidate) => candidate.id !== user.id)!;
    const { data: customers, error: customersError } = await user.client!
      .from("customers")
      .select("id,auth_user_id");
    if (customersError) throw customersError;
    assertCheck(
      customers.length === 1 && customers[0].id === user.customerId,
      `customer isolation ${user.key}`,
    );

    const { data: roles, error: rolesError } = await user.client!
      .from("user_roles")
      .select("user_id,role");
    if (rolesError) throw rolesError;
    const actualRoles = roles.map((row) => row.role).sort();
    const expectedRoles = [...user.expectedRoles].sort();
    assertCheck(
      roles.every((row) => row.user_id === user.id) &&
        JSON.stringify(actualRoles) === JSON.stringify(expectedRoles),
      `role isolation ${user.key}`,
    );

    const { data: companies, error: companiesError } = await user.client!
      .from("company_profiles")
      .select("customer_id,legal_name");
    if (companiesError) throw companiesError;
    const expectedCompanies = user.key === "b" ? 1 : 0;
    assertCheck(
      companies.length === expectedCompanies &&
        (expectedCompanies === 0 || companies[0].customer_id === user.customerId),
      `company isolation ${user.key}`,
    );

    const { error: staffPublicFieldsError } = await user.client!
      .from("staff_members")
      .select("id,employee_number")
      .limit(1);
    assertCheck(!staffPublicFieldsError, `staff public fields readable ${user.key}`);

    const { error: staffPrivateFieldsError } = await user.client!
      .from("staff_members")
      .select("email,phone,auth_user_id")
      .limit(1);
    assertCheck(Boolean(staffPrivateFieldsError), `staff private fields blocked ${user.key}`);

    const { data: crossUpdate, error: crossUpdateError } = await user.client!
      .from("customers")
      .update({ full_name: "Cross-user write must fail" })
      .eq("id", other.customerId!)
      .select("id");
    if (crossUpdateError) throw crossUpdateError;
    assertCheck(crossUpdate.length === 0, `cross-user update blocked ${user.key}`);

    const { error: roleInsertError } = await user.client!
      .from("user_roles")
      .insert({ user_id: user.id!, role: "administrator" });
    assertCheck(Boolean(roleInsertError), `role escalation blocked ${user.key}`);
  }

  const anon = createClient(url, publishable, clientOptions);
  const { error: anonError } = await anon.from("customers").select("id").limit(1);
  assertCheck(Boolean(anonError), "anonymous customer access blocked");

  console.log(
    JSON.stringify(
      { status: "PASS", project: STAGING_PROJECT_REF, users: users.length, checks },
      null,
      2,
    ),
  );
} finally {
  for (const client of activeClients) {
    await client.auth.signOut().catch(() => undefined);
  }
  const createdIds = users.flatMap((user) => (user.id ? [user.id] : []));
  if (createdIds.length) {
    await admin.from("customers").delete().in("auth_user_id", createdIds);
    for (const id of createdIds) {
      await admin.auth.admin.deleteUser(id).catch(() => undefined);
    }
  }
  const { data: leftovers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const orphanCount = (leftovers?.users || []).filter((user) =>
    user.email?.startsWith("bundle2.rls."),
  ).length;
  console.error(
    JSON.stringify({ cleanup: orphanCount === 0 ? "PASS" : "FAILED", orphanCount }),
  );
  if (orphanCount) process.exitCode = 1;
}
}

void main().catch((error: unknown) => {
  console.error(errorMessage(error));
  process.exitCode = 1;
});
