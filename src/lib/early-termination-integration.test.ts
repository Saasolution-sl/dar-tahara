import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("settlement migration enforces classification, ownership, and one invoice per calculation", () => {
  const sql = readFileSync(
    join(root, "supabase/migrations/20260730120000_early_termination_settlement.sql"),
    "utf8",
  );
  assert.match(sql, /invoice_type in \('standard', 'early_termination_settlement', 'prepaid_renewal'\)/);
  assert.match(sql, /unique index if not exists invoices_one_early_termination_settlement_idx[\s\S]*early_termination_calculation_id\)/);
  assert.match(sql, /early_termination_calculations_one_open_idx/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /early_termination_calculations_read_own/);
  assert.match(sql, /billing_interval = 'annual' and status = 'active' and auto_renew/);
});

test("confirmation is server-priced, explicitly confirmed, and idempotent", () => {
  const route = readFileSync(
    join(root, "src/app/api/account/subscriptions/[id]/cancellation/confirm/route.ts"),
    "utf8",
  );
  assert.match(route, /calculationId/);
  assert.match(route, /serviceInsertIgnoreDuplicates<SettlementInvoiceRow\[\]>/);
  assert.match(route, /"early_termination_calculation_id"/);
  assert.match(route, /invoice_type: "early_termination_settlement"/);
  assert.match(route, /status: "included_in_settlement"/);
  assert.doesNotMatch(route, /body\.(?:total|amount|price)/);
});

test("preview writes both final and legacy settlement columns during schema alignment", () => {
  const route = readFileSync(
    join(root, "src/app/api/account/subscriptions/[id]/cancellation/preview/route.ts"),
    "utf8",
  );
  assert.match(route, /elapsed_months: result\.completedMonths/);
  assert.match(route, /reclassified_term_code: result\.replacementTier\.code/);
  assert.match(route, /remaining_minimum_charge_cents: result\.remainingMinimumTermAmountCents/);
  assert.match(route, /outstanding_invoice_total_cents: result\.includedInvoiceOutstandingCents/);
});

test("prepaid portal and renewal workflow cannot enter monthly early termination", () => {
  const preview = readFileSync(
    join(root, "src/app/api/account/subscriptions/[id]/cancellation/preview/route.ts"),
    "utf8",
  );
  const subscriptionPage = readFileSync(
    join(root, "src/app/account/subscriptions/page.tsx"),
    "utf8",
  );
  const renewalJob = readFileSync(
    join(root, "src/app/api/jobs/prepaid-renewals/route.ts"),
    "utf8",
  );
  assert.match(preview, /billing_interval === "annual" \? "prepaid" : "monthly"/);
  assert.match(subscriptionPage, /DisableRenewalButton/);
  assert.match(renewalJob, /determinePrepaidRenewalAction/);
  assert.match(renewalJob, /invoice_type: "prepaid_renewal"/);
});

test("database rejects prepaid early-termination calculations and settlement invoices", () => {
  const sql = readFileSync(
    join(root, "supabase/migrations/20260730155756_prevent_prepaid_early_termination.sql"),
    "utf8",
  );
  assert.match(sql, /subscription_billing_interval is distinct from 'monthly'/);
  assert.match(sql, /early_termination_calculations_monthly_only/);
  assert.match(sql, /invoices_early_termination_monthly_only/);
  assert.match(sql, /payment_link\.status = 'active'/);
  assert.match(sql, /settlement_invoice\.status in \('draft', 'open', 'overdue', 'uncollectible'\)/);
  assert.match(sql, /action[\s\S]*invalid_prepaid_early_termination_voided/);
});

test("voided invalid settlements are hidden from customers and cannot be downloaded", () => {
  const invoicesPage = readFileSync(
    join(root, "src/app/account/invoices/page.tsx"),
    "utf8",
  );
  const downloadRoute = readFileSync(
    join(root, "src/app/api/account/invoices/[id]/download/route.ts"),
    "utf8",
  );
  assert.match(
    invoicesPage,
    /!\(invoice\.invoice_type === "early_termination_settlement" && invoice\.status === "void"\)/,
  );
  assert.match(
    downloadRoute,
    /invoice\.invoice_type === "early_termination_settlement" && invoice\.status === "void"/,
  );
});

test("draft settlement examples are visibly non-payable", () => {
  const downloadRoute = readFileSync(
    join(root, "src/app/api/account/invoices/[id]/download/route.ts"),
    "utf8",
  );
  assert.match(downloadRoute, /isDraftExample = invoice\.status === "draft"/);
  assert.match(downloadRoute, /Example - Early-Termination Settlement Invoice/);
  assert.match(downloadRoute, /Example only - no payment is due\./);
});
