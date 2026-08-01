import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect } from "@/lib/supabase-rpc";
import { generateInvoicePdf, money, type InvoicePaymentReference } from "@/lib/generate-invoice-pdf";
import { frequencies, type FrequencyKey } from "@/lib/pricing";
import { calculateAssessmentQuote, buildAnnualInvoiceBreakdown, ANNUAL_DISCOUNT_PERCENT } from "@/lib/assessment";
import { DEFAULT_DURATION_TIERS } from "@/lib/subscription-duration";
import { site } from "@/lib/site";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

// DEMO-ONLY CARVE-OUT: also allow http(s)://localhost(:port) so a locally
// seeded invoice can point at a real sample PDF for UI testing. This must be
// reverted before this route is ever deployed — production receipt_url
// values only ever come from real Stripe-hosted documents.
function isAllowedDocumentHost(url: URL): boolean {
  if (url.hostname === "stripe.com" || url.hostname.endsWith(".stripe.com")) return url.protocol === "https:";
  if ((url.hostname === "localhost" || url.hostname === "127.0.0.1") && process.env.NODE_ENV !== "production") return true;
  return false;
}

async function readLogoBytes(): Promise<Uint8Array | undefined> {
  try {
    return await readFile(path.join(process.cwd(), "public", "logo.png"));
  } catch {
    return undefined;
  }
}

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  stripe_invoice_id: string | null;
  amount_due_cents: number;
  currency: string;
  status: string;
  due_at: string | null;
  period_start: string | null;
  created_at: string;
  subscription_id: string | null;
  invoice_pdf_url: string | null;
  receipt_url: string | null;
  invoice_type: "standard" | "early_termination_settlement" | "prepaid_renewal";
  invoice_details: SettlementSnapshot | null;
};

type SettlementSnapshot = {
  completedMonths?: number;
  currentContractMonth?: number;
  originalTier?: { months?: number; label?: string };
  replacementTier?: { months?: number; label?: string };
  originalMonthlyCents?: number;
  replacementMonthlyCents?: number;
  amountPreviouslyPaidCents?: number;
  recalculatedConsumedPeriodCents?: number;
  discountCorrectionCents?: number;
  remainingMinimumMonths?: number;
  remainingMinimumTermAmountCents?: number;
  paymentsAllocatedToRemainingTermCents?: number;
  includedInvoiceOutstandingCents?: number;
  includedInvoiceIds?: string[];
  additionalChargesCents?: number;
  deepCleanRecoveryCents?: number;
  creditsCents?: number;
  settlementPaymentsAlreadyReceivedCents?: number;
  totalCents?: number;
};

type SubscriptionRow = {
  id: string;
  frequency: string;
  billing_interval: "monthly" | "annual";
  activated_at: string | null;
  original_contract_end_date: string | null;
  contract_duration_months: 3 | 6 | 9 | 12 | null;
  properties: { address_line1: string; city: string; declared_size_m2: number }[] | { address_line1: string; city: string; declared_size_m2: number } | null;
};

async function streamUpstream(customerId: string, id: string, raw: string | null, filenamePrefix: string) {
  if (!raw) return NextResponse.json({ error: "not_found" }, { status: 404 });
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({ error: "invalid_document" }, { status: 502 });
  }
  if (!isAllowedDocumentHost(url)) return NextResponse.json({ error: "invalid_document" }, { status: 502 });

  let upstream: Response;
  try {
    upstream = await fetch(url, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "document_unavailable" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) return NextResponse.json({ error: "document_unavailable" }, { status: 502 });

  await serviceInsert("customer_activity", { customer_id: customerId, event_type: "invoice_downloaded", resource_type: "invoice", resource_id: id, public_summary: "Invoice downloaded" });

  const filename = `${filenamePrefix}.pdf`.replace(/[^\w.-]/g, "_");
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeApi(["customer"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const customerId = auth.context.customerId;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !customerId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const rows = await serviceSelect<InvoiceRow[]>(
    `invoices?id=eq.${id}&customer_id=eq.${customerId}&select=id,invoice_number,stripe_invoice_id,amount_due_cents,currency,status,due_at,period_start,created_at,subscription_id,invoice_pdf_url,receipt_url,invoice_type,invoice_details&limit=1`,
  );
  const invoice = rows[0];
  if (!invoice) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (invoice.invoice_type === "early_termination_settlement" && invoice.status === "void") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const kind = req.nextUrl.searchParams.get("kind") === "receipt" ? "receipt" : "invoice";
  if (kind === "receipt") {
    return streamUpstream(customerId, id, invoice.receipt_url, `receipt-${invoice.invoice_number || id}`);
  }

  // Legacy/unlinked invoices (no subscription) have no pricing pipeline to regenerate from — fall back to whatever Stripe-hosted PDF is on file.
  if (!invoice.subscription_id) {
    return streamUpstream(customerId, id, invoice.invoice_pdf_url, `invoice-${invoice.invoice_number || id}`);
  }

  const [subRows, customerRows] = await Promise.all([
    serviceSelect<SubscriptionRow[]>(
      `subscriptions?id=eq.${invoice.subscription_id}&select=id,frequency,billing_interval,activated_at,original_contract_end_date,contract_duration_months,properties(address_line1,city,declared_size_m2)&limit=1`,
    ),
    serviceSelect<{ full_name: string; email: string; preferred_language: Locale }[]>(
      `customers?id=eq.${customerId}&select=full_name,email,preferred_language&limit=1`,
    ),
  ]);
  const sub = subRows[0];
  const customer = customerRows[0];
  if (!sub || !customer || !sub.contract_duration_months) {
    return streamUpstream(customerId, id, invoice.invoice_pdf_url, `invoice-${invoice.invoice_number || id}`);
  }

  const property = Array.isArray(sub.properties) ? sub.properties[0] : sub.properties;
  const propertyLabel = property ? `${property.address_line1}, ${property.city}` : sub.id;
  const issueDate = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(invoice.created_at));
  const dueDate = invoice.due_at ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(invoice.due_at)) : undefined;
  const paymentReferences: InvoicePaymentReference[] = invoice.stripe_invoice_id ? [{ label: propertyLabel, value: invoice.stripe_invoice_id }] : [];

  if (invoice.invoice_type === "early_termination_settlement" && invoice.invoice_details) {
    const details = invoice.invoice_details;
    const isDraftExample = invoice.status === "draft";
    const currency = invoice.currency.toUpperCase();
    const cents = (value: number | undefined) => money(currency, (value ?? 0) / 100);
    const originalTerm = details.originalTier?.months ?? sub.contract_duration_months ?? "-";
    const replacementTerm = details.replacementTier?.months ?? "-";
    const includedInvoiceNote = (details.includedInvoiceIds?.length ?? 0) > 0
      ? `${details.includedInvoiceIds?.length} outstanding standard invoice(s), totalling ${cents(details.includedInvoiceOutstandingCents)}, are included for resolution and are not charged a second time.`
      : "No outstanding standard invoices were absorbed into this settlement.";
    const pdf = await generateInvoicePdf({
      docType: isDraftExample
        ? "Example - Early-Termination Settlement Invoice"
        : "Early-Termination Settlement Invoice",
      number: invoice.invoice_number || id.slice(0, 8).toUpperCase(),
      date: issueDate,
      reference: dueDate ? `Due ${dueDate}` : undefined,
      accent: "#2f4c32",
      logoPngBytes: await readLogoBytes(),
      from: { name: site.name, lines: [`${site.addressLocality}, Morocco`, site.email, site.phoneDisplay] },
      to: { name: customer.full_name, lines: [customer.email] },
      items: [{
        description: `${propertyLabel} - ${sub.frequency}; original ${originalTerm}-month contract, recalculated to ${replacementTerm}-month minimum term`,
        qty: 1,
        rate: invoice.amount_due_cents / 100,
      }],
      currency,
      totals: [
        { label: `Original monthly price (${originalTerm} months)`, amount: cents(details.originalMonthlyCents) },
        { label: `Replacement monthly price (${replacementTerm} months)`, amount: cents(details.replacementMonthlyCents) },
        { label: `Recalculated completed period (${details.completedMonths ?? 0} months)`, amount: cents(details.recalculatedConsumedPeriodCents) },
        { label: "Amount already paid for completed period", amount: cents(-(details.amountPreviouslyPaidCents ?? 0)) },
        { label: "Discount correction", amount: cents(details.discountCorrectionCents) },
        { label: `Remaining minimum term (${details.remainingMinimumMonths ?? 0} months)`, amount: cents(details.remainingMinimumTermAmountCents) },
        { label: "Payments already allocated to remaining term", amount: cents(-(details.paymentsAllocatedToRemainingTermCents ?? 0)) },
        { label: "Additional charges", amount: cents(details.additionalChargesCents) },
        { label: "Deep-clean benefit recovery", amount: cents(details.deepCleanRecoveryCents) },
        { label: "Credits", amount: cents(-(details.creditsCents ?? 0)) },
        { label: "Settlement payments already received", amount: cents(-(details.settlementPaymentsAlreadyReceivedCents ?? 0)) },
        { label: "Final settlement amount", amount: cents(details.totalCents ?? invoice.amount_due_cents), emphasis: true },
      ],
      notes: [
        `Contract start: ${sub.activated_at ? new Date(sub.activated_at).toISOString().slice(0, 10) : "-"}. Original contract end: ${sub.original_contract_end_date ?? "-"}. Early-termination date: ${new Date(invoice.created_at).toISOString().slice(0, 10)}. Current contract month: ${details.currentContractMonth ?? "-"}.`,
        includedInvoiceNote,
      ].join(" "),
      payment: {
        method: isDraftExample
          ? "Example only - no payment is due."
          : "Pay using the secure payment link shown in your customer account.",
        descriptor: isDraftExample ? undefined : process.env.STRIPE_STATEMENT_DESCRIPTOR,
        references: paymentReferences,
      },
      terms: `This settlement is issued subject to Dar Tahara's Terms & Conditions: ${site.url}/${customer.preferred_language}/terms`,
      thanks: "Thank you for choosing Dar Tahara.",
    });
    await serviceInsert("customer_activity", { customer_id: customerId, event_type: "invoice_downloaded", resource_type: "invoice", resource_id: id, public_summary: "Early-termination settlement invoice downloaded" });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="early-termination-settlement-${(invoice.invoice_number || id).replace(/[^\w.-]/g, "_")}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const sizeM2 = property?.declared_size_m2;
  if (!sizeM2) return streamUpstream(customerId, id, invoice.invoice_pdf_url, `invoice-${invoice.invoice_number || id}`);

  const quote = calculateAssessmentQuote(sizeM2, sub.frequency as FrequencyKey, false, false, sub.contract_duration_months, DEFAULT_DURATION_TIERS);
  const freqPct = frequencies[sub.frequency as FrequencyKey]?.discountPercentage ?? 0;
  const breakdown = buildAnnualInvoiceBreakdown(quote, freqPct);
  if (!breakdown) return streamUpstream(customerId, id, invoice.invoice_pdf_url, `invoice-${invoice.invoice_number || id}`);
  const { subtotalCents, frequencyDiscountCents, durationDiscountCents, annualDiscountCents, totalCents } = breakdown;
  const trueListMonthlyCents = subtotalCents / 12;

  const pdf = await generateInvoicePdf({
    docType: "Invoice",
    number: invoice.invoice_number || invoice.stripe_invoice_id || id.slice(0, 8).toUpperCase(),
    date: issueDate,
    reference: dueDate ? `Due ${dueDate}` : undefined,
    accent: "#2f4c32",
    logoPngBytes: await readLogoBytes(),
    from: { name: site.name, lines: [`${site.addressLocality}, Morocco`, site.email, site.phoneDisplay] },
    to: { name: customer.full_name, lines: [customer.email] },
    items: [
      {
        description: `${propertyLabel} - ${sub.frequency}, ${sub.contract_duration_months}-month annual plan`,
        qty: 1,
        rate: trueListMonthlyCents / 100,
      },
    ],
    currency: "EUR",
    totals: [
      { label: "Subtotal", amount: money("EUR", subtotalCents / 100) },
      { label: "Frequency discount", amount: money("EUR", -frequencyDiscountCents / 100) },
      { label: "Duration discount", amount: money("EUR", -durationDiscountCents / 100) },
      { label: `Annual payment discount (${ANNUAL_DISCOUNT_PERCENT}%)`, amount: money("EUR", -annualDiscountCents / 100) },
      { label: "Tax", amount: money("EUR", 0) },
      { label: "Total", amount: money("EUR", totalCents / 100), emphasis: true },
    ],
    notes: "This invoice covers a full annual (12-month) billing cycle for this subscription, paid in advance.",
    payment: {
      method: "Charged automatically to the payment method saved on your subscription.",
      descriptor: process.env.STRIPE_STATEMENT_DESCRIPTOR,
      references: paymentReferences,
    },
    terms: `This invoice is issued subject to Dar Tahara's Terms & Conditions: ${site.url}/${customer.preferred_language}/terms`,
    thanks: "Thank you for choosing Dar Tahara.",
  });

  await serviceInsert("customer_activity", { customer_id: customerId, event_type: "invoice_downloaded", resource_type: "invoice", resource_id: id, public_summary: "Invoice downloaded" });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${(invoice.invoice_number || id).replace(/[^\w.-]/g, "_")}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
