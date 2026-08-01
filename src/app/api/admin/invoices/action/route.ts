import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { sendTransactionalEmail, type TransactionalTemplate } from "@/lib/transactional-email";
import { getBillingPolicy } from "@/lib/billing-policy";
import { createPaymentLinkRecord, type CreatedPaymentLink } from "@/lib/billing-links";
import { formatMoneyFromCents } from "@/lib/assessment";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

const ACTIONS = new Set(["resend_notice", "generate_replacement_link"]);

type InvoiceRow = {
  id: string; invoice_number: string | null; status: string; collection_stage: string | null;
  amount_due_cents: number; amount_paid_cents: number; subscription_id: string | null;
  customers: { email: string; full_name: string; preferred_language: Locale };
};

function siteRoot(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dartahara.com").replace(/\/$/, "");
}

/**
 * Financial notice actions — administrator only (matches this page's
 * historical `requireRole(['administrator'])` restriction, stricter than
 * the `staff` read access the listing route allows). Both actions are safe
 * to click repeatedly: `resend_notice` reuses a still-active link rather
 * than minting a new one, and `generate_replacement_link` explicitly
 * invalidates the old one first, so there is never more than one active
 * link per invoice.
 */
export async function POST(req: NextRequest) {
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json().catch(() => null)) as { id?: string; action?: string } | null;
  const id = body?.id;
  const action = body?.action;
  if (!id || !action || !ACTIONS.has(action)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const rows = await serviceSelect<InvoiceRow[]>(
    `invoices?id=eq.${id}&select=id,invoice_number,status,collection_stage,amount_due_cents,amount_paid_cents,subscription_id,customers(email,full_name,preferred_language)&limit=1`,
  );
  const invoice = rows[0];
  if (!invoice) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (invoice.status === "paid" || invoice.status === "void") return NextResponse.json({ error: "already_resolved" }, { status: 409 });
  if (!invoice.collection_stage) return NextResponse.json({ error: "no_active_collection_stage" }, { status: 409 });

  const policy = await getBillingPolicy();
  const outstandingCents = invoice.amount_due_cents - invoice.amount_paid_cents;
  const reference = invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase();

  if (action === "generate_replacement_link") {
    await serviceUpdate("payment_links", `invoice_id=eq.${invoice.id}&status=eq.active`, { status: "invalidated", invalidated_at: new Date().toISOString() });
  }

  let link: CreatedPaymentLink | null = null;
  if (action === "resend_notice") {
    const existing = await serviceSelect<{ id: string; token: string; expires_at: string }[]>(
      `payment_links?invoice_id=eq.${invoice.id}&status=eq.active&order=created_at.desc&limit=1`,
    );
    if (existing[0]) {
      link = { id: existing[0].id, token: existing[0].token, url: `${siteRoot()}/api/account/invoices/pay-link/${existing[0].token}`, expiresAt: new Date(existing[0].expires_at) };
    }
  }
  if (!link) {
    const linkType = invoice.collection_stage === "first_notice" ? "first_notice" : "second_notice";
    link = await createPaymentLinkRecord(invoice.id, linkType, policy);
  }

  const template: TransactionalTemplate = invoice.collection_stage === "first_notice" ? "payment_required_suspended" : "payment_required_final_notice";
  const cancellationUrl = template === "payment_required_final_notice" && invoice.subscription_id
    ? `${siteRoot()}/account/subscriptions?requestCancellation=${invoice.subscription_id}`
    : undefined;

  await sendTransactionalEmail({
    template,
    locale: invoice.customers.preferred_language, email: invoice.customers.email, name: invoice.customers.full_name,
    reference, amount: formatMoneyFromCents(outstandingCents, invoice.customers.preferred_language),
    date: new Intl.DateTimeFormat(invoice.customers.preferred_language, { day: "2-digit", month: "long", year: "numeric" }).format(link.expiresAt),
    actionUrl: link.url,
    secondaryActionUrl: cancellationUrl,
  });

  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: action === "generate_replacement_link" ? "invoice_replacement_link_generated" : "invoice_notice_resent",
    resource_type: "invoice", resource_id: invoice.id,
    previous_value: { collection_stage: invoice.collection_stage },
    new_value: { collection_stage: invoice.collection_stage, payment_link_id: link.id },
  });

  return NextResponse.json({ ok: true });
}
