/**
 * Builds (or tears down) a complete unpaid-subscription scenario on staging, so
 * the whole recovery journey can be walked end to end:
 *
 *   suspended subscription
 *     -> Overview tile shows "Pay subscription now"
 *     -> /api/account/invoices/pay-link/<token>
 *     -> Stripe Checkout (test mode)
 *     -> webhook marks the invoice paid and the link used
 *
 * Flipping operational_status alone is not enough: the tile's button resolves a
 * live payment link, and that link only exists if there is an actually unpaid
 * invoice behind it. So this creates the invoice and the link too, and points
 * the subscription's suspension_invoice_id at it.
 *
 *   $env:SEED_SUSPEND="on";  npx tsx scripts/toggle-staging-suspension.ts
 *   $env:SEED_SUSPEND="off"; npx tsx scripts/toggle-staging-suspension.ts
 *
 * Staging only. Suspension is a customer-visible billing state and this writes
 * a real unpaid invoice, so putting a live customer into it by accident is not
 * a risk worth taking.
 */
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const STAGING_PROJECT_REF = "ehzrroohsmwdkebezhiy";
const MARKER = "SEED:suspension";
const AMOUNT_CENTS = 4500;
const LINK_TTL_DAYS = 14;

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const mode = process.env.SEED_SUSPEND;
if (mode !== "on" && mode !== "off") throw new Error('Set SEED_SUSPEND to "on" or "off".');

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !secret) throw new Error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY.");
if (!url.includes(STAGING_PROJECT_REF)) {
  throw new Error(`Refusing to run against ${url}. Staging (${STAGING_PROJECT_REF}) only.`);
}

const db = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

type Sub = { id: string; customer_id: string; frequency: string };

async function tearDown() {
  // Clear the pointer before deleting the invoice it references.
  await db
    .from("subscriptions")
    .update({ operational_status: "active", suspension_invoice_id: null })
    .eq("operational_status", "suspended_for_non_payment");

  const { data: invoices } = await db.from("invoices").select("id").eq("invoice_number", MARKER);
  if (invoices?.length) {
    const ids = invoices.map((invoice) => invoice.id);
    // payment_links cascade on invoice delete, but be explicit about intent.
    await db.from("payment_links").delete().in("invoice_id", ids);
    await db.from("invoices").delete().in("id", ids);
  }
  console.log(`Cleared suspension; removed ${invoices?.length || 0} unpaid invoice(s) and their links.`);
}

async function main() {
  if (mode === "off") {
    await tearDown();
    return;
  }

  // Start clean so repeated runs do not stack up unpaid invoices.
  await tearDown();

  const { data, error } = await db
    .from("subscriptions")
    .select("id,customer_id,frequency")
    .eq("status", "active")
    .order("created_at")
    .limit(1);
  if (error) throw new Error(`subscriptions: ${JSON.stringify(error)}`);
  const sub = (data || [])[0] as Sub | undefined;
  if (!sub) throw new Error("No active subscription on staging.");

  const dueAt = new Date();
  dueAt.setUTCDate(dueAt.getUTCDate() - 10); // already past due

  const { data: invoice, error: invoiceError } = await db
    .from("invoices")
    .insert({
      customer_id: sub.customer_id,
      subscription_id: sub.id,
      status: "overdue",
      amount_due_cents: AMOUNT_CENTS,
      amount_paid_cents: 0,
      currency: "eur",
      invoice_number: MARKER,
      due_at: dueAt.toISOString(),
      period_start: dueAt.toISOString(),
    })
    .select("id")
    .single();
  if (invoiceError || !invoice) throw new Error(`invoices: ${JSON.stringify(invoiceError)}`);

  // 32 random bytes, matching what the route expects to be unguessable; the URL
  // carries nothing else identifying.
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + LINK_TTL_DAYS);

  const { error: linkError } = await db.from("payment_links").insert({
    invoice_id: (invoice as { id: string }).id,
    token,
    link_type: "first_notice",
    status: "active",
    expires_at: expiresAt.toISOString(),
    created_by: "system",
  });
  if (linkError) throw new Error(`payment_links: ${JSON.stringify(linkError)}`);

  const { error: subError } = await db
    .from("subscriptions")
    .update({
      operational_status: "suspended_for_non_payment",
      suspension_invoice_id: (invoice as { id: string }).id,
    })
    .eq("id", sub.id);
  if (subError) throw new Error(`suspend: ${JSON.stringify(subError)}`);

  console.log(`Suspended the ${sub.frequency} subscription (${sub.id.slice(0, 8)}).`);
  console.log(`Unpaid invoice: ${MARKER}, EUR ${(AMOUNT_CENTS / 100).toFixed(2)}, overdue since ${dueAt.toISOString().slice(0, 10)}.`);
  console.log(`Payment link active for ${LINK_TTL_DAYS} days.`);
  console.log(`\nDirect link: http://localhost:3200/api/account/invoices/pay-link/${token}`);
  console.log("Stripe is in TEST mode - pay with card 4242 4242 4242 4242, any future expiry, any CVC.");
}

main().catch((error) => {
  console.error(`\nFailed: ${error.message}`);
  process.exit(1);
});
