import { NextRequest, NextResponse } from "next/server";
import { serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { createInvoicePaymentCheckoutSession } from "@/lib/stripe";
import { isPaymentLinkExpired } from "@/lib/billing-lifecycle";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

type PaymentLinkRow = { id: string; invoice_id: string; status: string; expires_at: string };
type InvoiceRow = { id: string; invoice_number: string | null; invoice_type: "standard" | "early_termination_settlement" | "prepaid_renewal"; amount_due_cents: number; amount_paid_cents: number; status: string; customer_id: string };
type CustomerRow = { email: string; preferred_language: Locale };

/**
 * Redeems a secure, single-purpose, time-limited payment link clicked from
 * an email. Deliberately does NOT require an active portal session — the
 * token itself (32 random bytes, unguessable) is the sole authority, and
 * the URL carries nothing else identifying (no invoice id, no customer id)
 * so it can't be enumerated or correlated. A fresh Stripe Checkout Session
 * is created only once the token is confirmed valid, unexpired, and the
 * invoice still has a real outstanding balance.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invalid = () => NextResponse.redirect(new URL("/account/invoices?payment=invalid", req.url));

  if (!token || token.length < 20) return invalid();

  const links = await serviceSelect<PaymentLinkRow[]>(
    `payment_links?token=eq.${encodeURIComponent(token)}&select=id,invoice_id,status,expires_at&limit=1`,
  );
  const link = links[0];
  if (!link) return invalid();

  if (link.status === "used") return NextResponse.redirect(new URL("/account/invoices?payment=already_paid", req.url));
  if (link.status === "invalidated") return NextResponse.redirect(new URL("/account/invoices?payment=already_resolved", req.url));
  if (link.status === "expired" || isPaymentLinkExpired(link.expires_at, new Date())) {
    if (link.status !== "expired") await serviceUpdate("payment_links", `id=eq.${link.id}`, { status: "expired" });
    return NextResponse.redirect(new URL("/account/invoices?payment=expired", req.url));
  }

  const invoices = await serviceSelect<InvoiceRow[]>(
    `invoices?id=eq.${link.invoice_id}&select=id,invoice_number,invoice_type,amount_due_cents,amount_paid_cents,status,customer_id&limit=1`,
  );
  const invoice = invoices[0];
  if (!invoice) return invalid();
  if (invoice.status === "paid" || invoice.status === "void") {
    await serviceUpdate("payment_links", `id=eq.${link.id}`, { status: "invalidated", invalidated_at: new Date().toISOString() });
    return NextResponse.redirect(new URL("/account/invoices?payment=already_resolved", req.url));
  }

  const outstandingCents = invoice.amount_due_cents - invoice.amount_paid_cents;
  if (outstandingCents <= 0) {
    await serviceUpdate("payment_links", `id=eq.${link.id}`, { status: "invalidated", invalidated_at: new Date().toISOString() });
    return NextResponse.redirect(new URL("/account/invoices?payment=already_resolved", req.url));
  }

  const customers = await serviceSelect<CustomerRow[]>(
    `customers?id=eq.${invoice.customer_id}&select=email,preferred_language&limit=1`,
  );
  const customer = customers[0];
  if (!customer) return invalid();

  try {
    const session = await createInvoicePaymentCheckoutSession({
      invoiceId: invoice.id,
      paymentLinkId: link.id,
      customerEmail: customer.email,
      locale: customer.preferred_language,
      amountCents: outstandingCents,
      invoiceReference: invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase(),
      invoiceType: invoice.invoice_type,
      requestOrigin: req.nextUrl.origin,
    });
    if (!session.url) return NextResponse.redirect(new URL("/account/invoices?payment=error", req.url));
    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("[pay-link]", error instanceof Error ? error.message : "unknown");
    return NextResponse.redirect(new URL("/account/invoices?payment=error", req.url));
  }
}
