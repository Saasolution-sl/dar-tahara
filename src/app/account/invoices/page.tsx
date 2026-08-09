import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  InvoiceStatementTable,
  type InvoiceStatementTableRow,
} from "@/components/portal/invoice-statement-table";
import {
  InvoiceUnitFilter,
  type InvoiceUnitOption,
} from "@/components/portal/invoice-unit-filter";
import { buttonVariants } from "@/components/ui/button";
import { portalCopy } from "@/i18n/portal-copy";
import { requireCustomerPortal } from "@/lib/feature-flags";
import { compactInvoiceReference } from "@/lib/invoice-reference";
import { filterRecordsByUnit, invoiceUnitId } from "@/lib/invoice-unit";
import {
  buildMonthlyStatements,
  type MonthlyInvoiceLine,
  type MonthlyUnit,
} from "@/lib/monthly-statement";
import { monthsCoveredByPause } from "@/lib/pause-eligibility";
import { money, shortDate } from "@/lib/portal-format";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { createClient } from "@/lib/supabase/server";
import { serviceSelect } from "@/lib/supabase-rpc";

type PropertyRow = { id: string; address_line1: string; city: string };
type SubscriptionRow = {
  id: string;
  frequency: string;
  status: string;
  billing_interval: string;
  created_at: string;
  operational_status: string;
  suspension_invoice_id: string | null;
  properties: PropertyRow[] | PropertyRow | null;
};
type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  stripe_invoice_id: string | null;
  status: string;
  amount_due_cents: number;
  amount_paid_cents: number;
  currency: string;
  due_at: string | null;
  period_start: string | null;
  created_at: string;
  invoice_pdf_url: string | null;
  receipt_url: string | null;
  subscription_id: string | null;
  invoice_type: "standard" | "early_termination_settlement" | "prepaid_renewal";
  is_final_settlement: boolean;
};
type PauseRequestRow = {
  id: string;
  status: string;
  approved_start_date: string | null;
  approved_end_date: string | null;
  subscriptions:
    | ({ id: string; properties: PropertyRow[] | PropertyRow | null }[])
    | { id: string; properties: PropertyRow[] | PropertyRow | null }
    | null;
};
type SortedTableRow = InvoiceStatementTableRow & { sortKey: string };

const DASH = "Not available";
const STATEMENT_EXCLUDED_STATUSES = new Set([
  "included_in_settlement",
  "void",
  "refunded",
  "uncollectible",
]);

function firstProperty(properties: PropertyRow[] | PropertyRow | null | undefined) {
  return Array.isArray(properties) ? properties[0] : properties;
}

function invoiceMonth(invoice: InvoiceRow) {
  return (invoice.period_start || invoice.created_at).slice(0, 7);
}

function displayStatus(invoices: InvoiceRow[]) {
  for (const status of ["overdue", "open", "draft", "paid"]) {
    if (invoices.some((invoice) => invoice.status === status)) return status;
  }
  return invoices[0]?.status || "on_hold";
}

function invoiceDownloadHref(invoice: InvoiceRow) {
  if (invoice.invoice_pdf_url || invoice.subscription_id) {
    return `/api/account/invoices/${invoice.id}/download?kind=invoice`;
  }
  if (invoice.receipt_url) {
    return `/api/account/invoices/${invoice.id}/download?kind=receipt`;
  }
  return undefined;
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string | string[] }>;
}) {
  await requireCustomerPortal();
  const context = await requireAuth();
  const locale = await getRequestLocale();
  const c = portalCopy[locale];
  const ic = c.invoices;
  const db = await createClient();
  const customerId = context.customerId || "00000000-0000-0000-0000-000000000000";

  const [subscriptions, invoices, pauseRequests] = await Promise.all([
    db
      .from("subscriptions")
      .select(
        "id,frequency,status,billing_interval,created_at,operational_status,suspension_invoice_id,properties(id,address_line1,city)",
      )
      .eq("customer_id", customerId),
    db
      .from("invoices")
      .select(
        "id,invoice_number,stripe_invoice_id,status,amount_due_cents,amount_paid_cents,currency,due_at,period_start,created_at,invoice_pdf_url,receipt_url,subscription_id,invoice_type,is_final_settlement",
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    db
      .from("pause_requests")
      .select(
        "id,status,approved_start_date,approved_end_date,subscriptions(id,properties(id,address_line1,city))",
      )
      .eq("customer_id", customerId)
      .in("status", ["active", "completed"]),
  ]);

  const subs = (subscriptions.data || []) as SubscriptionRow[];
  const allInvoices = (invoices.data || []) as InvoiceRow[];
  const monthlySubs = subs.filter((subscription) => subscription.billing_interval === "monthly");
  const annualSubs = subs.filter((subscription) => subscription.billing_interval === "annual");

  const propertyLabel = (subscription: SubscriptionRow | undefined): string => {
    if (!subscription) return DASH;
    const property = firstProperty(subscription.properties);
    return property ? `${property.address_line1}, ${property.city}` : subscription.id;
  };
  const unitOptions = Array.from(
    new Map(
      subs.map((subscription) => [
        invoiceUnitId(subscription),
        {
          value: invoiceUnitId(subscription),
          label: propertyLabel(subscription),
        } satisfies InvoiceUnitOption,
      ]),
    ).values(),
  ).sort((left, right) => left.label.localeCompare(right.label, locale));
  const requestedUnit = (await searchParams).unit;
  const requestedUnitId = Array.isArray(requestedUnit) ? requestedUnit[0] : requestedUnit;
  const selectedUnitId = unitOptions.some((option) => option.value === requestedUnitId)
    ? requestedUnitId || null
    : null;
  const filteredMonthlySubs = filterRecordsByUnit(monthlySubs, selectedUnitId);
  const filteredAnnualSubs = filterRecordsByUnit(annualSubs, selectedUnitId);
  const monthlySubIds = new Set(filteredMonthlySubs.map((subscription) => subscription.id));
  const annualSubIds = new Set(filteredAnnualSubs.map((subscription) => subscription.id));
  const formatMonth = (month: string) =>
    new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
      new Date(`${month}-01T00:00:00Z`),
    );

  const statementInvoices = allInvoices.filter(
    (invoice) =>
      invoice.invoice_type === "standard" &&
      !STATEMENT_EXCLUDED_STATUSES.has(invoice.status) &&
      Boolean(invoice.subscription_id && monthlySubIds.has(invoice.subscription_id)),
  );
  const units: MonthlyUnit[] = filteredMonthlySubs.map((subscription) => ({
    subscriptionId: subscription.id,
    propertyLabel: propertyLabel(subscription),
    frequency: subscription.frequency,
    status: subscription.status,
    createdAt: subscription.created_at,
  }));
  const monthlyInvoiceLines: MonthlyInvoiceLine[] = statementInvoices.map((invoice) => ({
    subscriptionId: invoice.subscription_id as string,
    periodStart: invoice.period_start || invoice.created_at,
    amountCents: invoice.amount_due_cents,
    currency: invoice.currency,
    stripeInvoiceId: invoice.stripe_invoice_id,
  }));
  const statements = buildMonthlyStatements(units, monthlyInvoiceLines);

  const monthlySpecialInvoices = allInvoices.filter(
    (invoice) =>
      invoice.invoice_type !== "standard" &&
      !(invoice.invoice_type === "early_termination_settlement" && invoice.status === "void") &&
      Boolean(invoice.subscription_id && monthlySubIds.has(invoice.subscription_id)),
  );
  const annualInvoices = allInvoices.filter(
    (invoice) =>
      !(invoice.invoice_type === "early_termination_settlement" && invoice.status === "void") &&
      (Boolean(invoice.subscription_id && annualSubIds.has(invoice.subscription_id)) ||
        (!selectedUnitId && !invoice.subscription_id)),
  );

  // Any unpaid invoice can be settled, not just an early-termination one. A
  // token is only offered when the link is still live, so the customer never
  // clicks Pay now and lands on an "expired" redirect.
  const nowIso = new Date().toISOString();
  const payableInvoices = allInvoices.filter(
    (invoice) => invoice.status === "open" || invoice.status === "overdue",
  );
  const paymentTokens = Object.fromEntries(
    await Promise.all(
      payableInvoices.map(async (invoice) => {
        try {
          const [paymentLink] = await serviceSelect<{ token: string }[]>(
            `payment_links?invoice_id=eq.${invoice.id}&status=eq.active&expires_at=gt.${encodeURIComponent(nowIso)}&order=created_at.desc&limit=1&select=token`,
          );
          return [invoice.id, paymentLink?.token] as const;
        } catch {
          // Without service-role access locally the row simply falls back to
          // its download action rather than failing the whole page.
          return [invoice.id, undefined] as const;
        }
      }),
    ),
  );

  /** The live payment token for whichever invoice in this group is unpaid. */
  function paymentHrefFor(invoices: InvoiceRow[]): string | undefined {
    for (const invoice of invoices) {
      const token = paymentTokens[invoice.id];
      if (token) return `/api/account/invoices/pay-link/${token}`;
    }
    return undefined;
  }

  const statementRows: SortedTableRow[] = statements.map((statement) => {
    const sourceInvoices = statementInvoices.filter(
      (invoice) => invoiceMonth(invoice) === statement.monthKey,
    );
    const latestDate = sourceInvoices
      .map((invoice) => invoice.created_at)
      .sort()
      .at(-1);
    const earliestDue = sourceInvoices
      .map((invoice) => invoice.due_at)
      .filter((date): date is string => Boolean(date))
      .sort()[0];
    const fullReference = `STMT-${statement.monthKey}-${
      selectedUnitId ? `${selectedUnitId.slice(0, 8).toUpperCase()}-` : ""
    }${customerId.slice(0, 8).toUpperCase()}`;

    return {
      key: `statement-${statement.monthKey}`,
      sortKey: latestDate || `${statement.monthKey}-01`,
      month: formatMonth(statement.monthKey),
      amount: money(statement.totalCents, statement.currency, locale),
      status: displayStatus(sourceInvoices),
      date: shortDate(latestDate, locale),
      due: shortDate(earliestDue, locale),
      reference: compactInvoiceReference(fullReference, customerId),
      downloadHref: `/api/account/invoices/statement/${statement.monthKey}/download${
        selectedUnitId ? `?unit=${encodeURIComponent(selectedUnitId)}` : ""
      }`,
      // A statement aggregates a month of invoices; if any one of them is still
      // unpaid, that month's row is what the customer needs to act on.
      paymentHref: paymentHrefFor(sourceInvoices),
    };
  });

  const specialInvoiceRows: SortedTableRow[] = monthlySpecialInvoices.map((invoice) => {
    const month = invoiceMonth(invoice);
    return {
      key: invoice.id,
      sortKey: invoice.created_at,
      month: formatMonth(month),
      amount: money(invoice.amount_due_cents, invoice.currency, locale),
      status: invoice.status,
      statusNote:
        invoice.invoice_type === "early_termination_settlement"
          ? ic.finalSettlementBadge
          : undefined,
      date: shortDate(invoice.created_at, locale),
      due: shortDate(invoice.due_at, locale),
      reference: compactInvoiceReference(
        invoice.invoice_number || invoice.stripe_invoice_id,
        invoice.id,
      ),
      downloadHref: invoiceDownloadHref(invoice),
      paymentHref: paymentHrefFor([invoice]),
    };
  });

  const pauseRows: SortedTableRow[] = ((pauseRequests.data || []) as PauseRequestRow[])
    .filter((request) => request.approved_start_date && request.approved_end_date)
    .flatMap((request) => {
      const subscription = Array.isArray(request.subscriptions)
        ? request.subscriptions[0]
        : request.subscriptions;
      const property = firstProperty(subscription?.properties);
      const unitId = property?.id || subscription?.id || request.id;
      if (selectedUnitId && unitId !== selectedUnitId) return [];

      return monthsCoveredByPause(
        request.approved_start_date as string,
        request.approved_end_date as string,
      ).map((month) => {
        const fullReference = `PAUSE-${month}-${request.id.slice(0, 8).toUpperCase()}`;
        return {
          key: `pause-${request.id}-${month}`,
          sortKey: `${month}-01`,
          month: formatMonth(month),
          amount: money(0, "EUR", locale),
          status: ic.pauseNoticesTitle,
          date: shortDate(request.approved_start_date, locale),
          due: DASH,
          reference: compactInvoiceReference(fullReference, request.id),
          downloadHref: `/api/account/invoices/pause-notice/${request.id}/${month}/download`,
        };
      });
    });

  const monthlyRows = [...statementRows, ...specialInvoiceRows, ...pauseRows]
    .sort((left, right) => right.sortKey.localeCompare(left.sortKey))
    .map(({ sortKey: _sortKey, ...row }) => row);

  const annualRows = annualInvoices
    .map<SortedTableRow>((invoice) => {
      const month = invoiceMonth(invoice);
      return {
        key: invoice.id,
        sortKey: invoice.created_at,
        month: formatMonth(month),
        amount: money(invoice.amount_due_cents, invoice.currency, locale),
        status: invoice.status,
        statusNote:
          invoice.invoice_type === "early_termination_settlement"
            ? ic.finalSettlementBadge
            : undefined,
        date: shortDate(invoice.created_at, locale),
        due: shortDate(invoice.due_at, locale),
        reference: compactInvoiceReference(
          invoice.invoice_number || invoice.stripe_invoice_id,
          invoice.id,
        ),
        downloadHref: invoiceDownloadHref(invoice),
        paymentHref: paymentHrefFor([invoice]),
      };
    })
    .sort((left, right) => right.sortKey.localeCompare(left.sortKey))
    .map(({ sortKey: _sortKey, ...row }) => row);

  const suspendedSub = subs.find(
    (subscription) =>
      subscription.operational_status === "suspended_for_non_payment" &&
      subscription.suspension_invoice_id,
  );
  const suspensionInvoice = suspendedSub
    ? allInvoices.find((invoice) => invoice.id === suspendedSub.suspension_invoice_id)
    : undefined;
  const activePaymentLink = suspensionInvoice
    ? (
        await serviceSelect<{ token: string; expires_at: string }[]>(
          `payment_links?invoice_id=eq.${suspensionInvoice.id}&status=eq.active&order=created_at.desc&limit=1&select=token,expires_at`,
        )
      )[0]
    : undefined;
  const suspensionOutstandingCents = suspensionInvoice
    ? suspensionInvoice.amount_due_cents - suspensionInvoice.amount_paid_cents
    : 0;
  const suspensionReference =
    suspensionInvoice?.invoice_number ||
    suspensionInvoice?.stripe_invoice_id ||
    suspensionInvoice?.id.slice(0, 8).toUpperCase() ||
    "";
  const suspensionBody = suspensionInvoice
    ? ic.suspensionBody
        .replace("{reference}", suspensionReference)
        .replace(
          "{amount}",
          money(suspensionOutstandingCents, suspensionInvoice.currency, locale),
        )
        .replace(
          "{date}",
          activePaymentLink ? shortDate(activePaymentLink.expires_at, locale) : DASH,
        )
    : "";

  const tableLabels = {
    month: ic.columnMonth,
    amount: c.dashboard.amount,
    status: c.dashboard.status,
    date: c.dashboard.date,
    due: c.dashboard.due,
    reference: c.dashboard.reference,
    download: c.dashboard.download,
    payNow: ic.payNow,
  };

  return (
    <div>
      <h1 className="font-serif text-4xl">{c.nav.invoices}</h1>

      {suspendedSub && suspensionInvoice ? (
        <section className="mt-7 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
            <div className="flex-1">
              <h2 className="font-serif text-xl text-red-800">{ic.suspensionTitle}</h2>
              <p className="mt-1 text-sm text-red-700">{suspensionBody}</p>
              {/*
                No action here on purpose: paying happens on the unpaid row
                below, so there is one obvious place to do it rather than two
                competing buttons. This box explains the situation; the row
                resolves it.
              */}
              <p className="mt-3 text-xs leading-5 text-red-700">{ic.suspensionTermsNote}</p>
              {!activePaymentLink ? (
                <p className="mt-2 text-xs text-red-700">{ic.suspensionNoLinkNote}</p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <InvoiceUnitFilter
        label={ic.filterByUnit}
        allUnitsLabel={ic.allUnits}
        options={unitOptions}
        selectedUnit={selectedUnitId}
      />

      <InvoiceStatementTable
        title={ic.monthlyStatementsTitle}
        emptyMessage={ic.noStatements}
        rows={monthlyRows}
        labels={tableLabels}
      />
      <InvoiceStatementTable
        title={ic.annualStatementsTitle}
        emptyMessage={ic.noAnnualInvoices}
        rows={annualRows}
        labels={tableLabels}
      />
    </div>
  );
}
