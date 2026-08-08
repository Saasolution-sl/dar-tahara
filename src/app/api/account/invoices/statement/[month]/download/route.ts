import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect } from "@/lib/supabase-rpc";
import { buildLineDiscountBreakdowns, buildMonthlyStatements, type MonthlyInvoiceLine, type MonthlyUnit } from "@/lib/monthly-statement";
import { filterRecordsByUnit } from "@/lib/invoice-unit";
import { generateInvoicePdf, money, type InvoicePaymentReference } from "@/lib/generate-invoice-pdf";
import { site } from "@/lib/site";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

type SubscriptionRow = {
  id: string;
  frequency: string;
  status: string;
  created_at: string;
  price_before_duration_discount_cents: number | null;
  properties: { id: string; address_line1: string; city: string }[] | { id: string; address_line1: string; city: string } | null;
};
type InvoiceRow = {
  subscription_id: string | null;
  period_start: string | null;
  created_at: string;
  amount_due_cents: number;
  currency: string;
  stripe_invoice_id: string | null;
  status: string;
  invoice_type: "standard" | "early_termination_settlement" | "prepaid_renewal";
};

/** No logo file exists in the repo yet: read it if/when one is added, without requiring a code change. */
async function readLogoBytes(): Promise<Uint8Array | undefined> {
  try {
    return await readFile(path.join(process.cwd(), "public", "logo.png"));
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ month: string }> }) {
  const auth = await authorizeApi(["customer"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month) || !auth.context.customerId) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const customerId = auth.context.customerId;
  const requestedUnitId = req.nextUrl.searchParams.get("unit");

  const [{ full_name: customerName, email: customerEmail, preferred_language: locale }] = await serviceSelect<{ full_name: string; email: string; preferred_language: Locale }[]>(
    `customers?id=eq.${customerId}&select=full_name,email,preferred_language&limit=1`,
  );

  const allMonthlySubs = await serviceSelect<SubscriptionRow[]>(
    `subscriptions?customer_id=eq.${customerId}&billing_interval=eq.monthly&select=id,frequency,status,created_at,price_before_duration_discount_cents,properties(id,address_line1,city)`,
  );
  const monthlySubs = filterRecordsByUnit(allMonthlySubs, requestedUnitId);
  if (!monthlySubs.length) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const subscriptionIds = monthlySubs.map((s) => s.id);

  const invoiceRows = await serviceSelect<InvoiceRow[]>(
    `invoices?subscription_id=in.(${subscriptionIds.join(",")})&invoice_type=eq.standard&status=not.in.(included_in_settlement,void,refunded,uncollectible)&select=subscription_id,period_start,created_at,amount_due_cents,currency,stripe_invoice_id,status,invoice_type`,
  );

  const propertyLabel = (row: SubscriptionRow): string => {
    const property = Array.isArray(row.properties) ? row.properties[0] : row.properties;
    return property ? `${property.address_line1}, ${property.city}` : row.id;
  };

  const units: MonthlyUnit[] = monthlySubs.map((s) => ({
    subscriptionId: s.id,
    propertyLabel: propertyLabel(s),
    frequency: s.frequency,
    status: s.status,
    createdAt: s.created_at,
    originalPriceCents: s.price_before_duration_discount_cents,
  }));
  const invoices: MonthlyInvoiceLine[] = invoiceRows
    .filter((inv): inv is InvoiceRow & { subscription_id: string } => Boolean(inv.subscription_id))
    .map((inv) => ({
      subscriptionId: inv.subscription_id,
      periodStart: inv.period_start || inv.created_at,
      amountCents: inv.amount_due_cents,
      currency: inv.currency,
      stripeInvoiceId: inv.stripe_invoice_id,
    }));

  const statement = buildMonthlyStatements(units, invoices).find((s) => s.monthKey === month);
  if (!statement) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const chargedLines = statement.lines.filter((line) => !line.onHold);
  const lineBreakdowns = new Map(buildLineDiscountBreakdowns(statement.lines).map((b) => [b.subscriptionId, b]));
  const { subtotalCents, frequencyDiscountCents, durationDiscountCents } = Array.from(lineBreakdowns.values()).reduce(
    (acc, b) => ({
      subtotalCents: acc.subtotalCents + b.trueListPriceCents,
      frequencyDiscountCents: acc.frequencyDiscountCents + b.frequencyDiscountCents,
      durationDiscountCents: acc.durationDiscountCents + b.durationDiscountCents,
    }),
    { subtotalCents: 0, frequencyDiscountCents: 0, durationDiscountCents: 0 },
  );

  const paymentReferences: InvoicePaymentReference[] = chargedLines
    .filter((line) => line.stripeInvoiceId)
    .map((line) => ({ label: line.propertyLabel, value: line.stripeInvoiceId as string }));

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(`${month}-01T00:00:00Z`));
  const issueDate = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
  const pdf = await generateInvoicePdf({
    docType: "Statement",
    number: `STMT-${month}-${requestedUnitId ? `${requestedUnitId.slice(0, 8).toUpperCase()}-` : ""}${customerId.slice(0, 8).toUpperCase()}`,
    date: issueDate,
    reference: monthLabel,
    accent: "#2f4c32",
    logoPngBytes: await readLogoBytes(),
    from: { name: site.name, lines: [`${site.addressLocality}, Morocco`, site.email, site.phoneDisplay] },
    to: { name: customerName, lines: [customerEmail] },
    items: statement.lines.map((line) => {
      const breakdown = lineBreakdowns.get(line.subscriptionId);
      return {
        description: `${line.propertyLabel}${line.onHold ? " (on hold)" : `: ${line.frequency}`}`,
        qty: 1,
        // The list price (Subtotal), before the frequency/duration discounts broken out below: not what was actually charged.
        rate: breakdown ? breakdown.trueListPriceCents / 100 : line.amountCents / 100,
      };
    }),
    currency: "EUR",
    totals: [
      { label: "Subtotal", amount: money("EUR", subtotalCents / 100) },
      { label: "Frequency discount", amount: money("EUR", -frequencyDiscountCents / 100) },
      { label: "Duration discount", amount: money("EUR", -durationDiscountCents / 100) },
      { label: "Tax", amount: money("EUR", 0) },
      { label: "Total", amount: money("EUR", statement.totalCents / 100), emphasis: true },
    ],
    notes: requestedUnitId
      ? "This statement contains the selected monthly-billed unit for the period shown. Annually-billed units are invoiced separately."
      : "This statement combines all monthly-billed units on your account for the period shown. Annually-billed units are invoiced separately.",
    payment: {
      method: "Charged automatically to the payment method saved on your subscription.",
      descriptor: process.env.STRIPE_STATEMENT_DESCRIPTOR,
      references: paymentReferences,
    },
    terms: `This statement is issued subject to Dar Tahara's Terms & Conditions: ${site.url}/${locale}/terms`,
    thanks: "Thank you for choosing Dar Tahara.",
  });

  await serviceInsert("customer_activity", { customer_id: customerId, event_type: "statement_downloaded", public_summary: `Monthly statement downloaded for ${month}` });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="statement-${month}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
