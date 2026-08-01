import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("company, manager and assessment roles are database-backed and separately routed", () => {
  const migration = read("supabase/migrations/20260731154109_multi_profile_company_manager_assessment.sql");
  const routing = read("src/lib/portal-routing.ts");
  assert.match(migration, /'customer_company'[\s\S]*'assessment'[\s\S]*'manager'/);
  assert.match(migration, /create table if not exists public\.company_profiles/);
  assert.match(migration, /chamber_of_commerce_number text not null/);
  assert.match(routing, /roles\.includes\("manager"\)[\s\S]*return "\/manager"/);
  assert.match(routing, /roles\.includes\("assessment"\)[\s\S]*return "\/assessment"/);
});

test("assessment completion requires assigned personnel, complete fields and private customer ID evidence", () => {
  const migration = read("supabase/migrations/20260731154109_multi_profile_company_manager_assessment.sql");
  const completion = read("src/app/api/assessment-employee/assessments/complete/route.ts");
  assert.match(migration, /'assessment-confirmations'[\s\S]*false[\s\S]*10485760/);
  assert.match(migration, /revoke all on table public\.assessment_confirmations from anon, authenticated/);
  assert.match(migration, /require_assessment_confirmation/);
  assert.match(completion, /assigned_staff_id=eq\.\$\{staff\.id\}/);
  assert.match(completion, /assessment_identity_photo_required/);
  assert.match(completion, /sendTransactionalEmail/);
  const retention = read("src/app/api/jobs/assessment-confirmations-retention/route.ts");
  const vercel = read("vercel.json");
  assert.match(retention, /retention_delete_after=lte/);
  assert.match(retention, /bucket\.remove/);
  assert.match(retention, /evidence_deleted_at/);
  assert.match(vercel, /assessment-confirmations-retention/);
});

test("manager approval and refunds are role-restricted and audited", () => {
  const actions = read("src/app/api/admin/assessments/action/route.ts");
  const refunds = read("src/app/api/admin/refund/route.ts");
  assert.match(actions, /authorizeApi\(\["manager","administrator"\]\)/);
  assert.match(actions, /actor_type: isManager \? "manager" : "admin"/);
  assert.match(refunds, /authorizeApi\(\["manager", "administrator"\]\)/);
  assert.match(refunds, /approved_by_manager_user_id/);
  assert.match(refunds, /action: "refund_confirmed"/);
});

test("internal invitations suppress customer provisioning without trusting metadata for authorization", () => {
  const migration = read("supabase/migrations/20260731154109_multi_profile_company_manager_assessment.sql");
  const teamRoute = read("src/app/api/admin/team/route.ts");
  assert.match(migration, /when \(coalesce\(new\.raw_user_meta_data ->> 'invited_profile'/i);
  assert.match(teamRoute, /serviceUpsert\("user_roles"/);
  assert.match(teamRoute, /authorizeApi\(\["administrator"\]\)/);
});
