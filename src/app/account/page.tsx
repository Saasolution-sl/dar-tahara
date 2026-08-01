import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PortalCard, StatusBadge } from "@/components/portal/portal-shell";
import { portalCopy } from "@/i18n/portal-copy";
import {
  countSubscriptions,
  selectCurrentMonthInvoice,
  selectNextPayment,
  selectUpcomingAdditionalService,
  selectUpcomingMaintenance,
  summarizeOutstandingInvoices,
  type OverviewAdditionalService,
  type OverviewInvoice,
  type OverviewServiceBooking,
  type OverviewSubscription,
} from "@/lib/account-overview";
import { requireCustomerPortal } from "@/lib/feature-flags";
import { compactInvoiceReference } from "@/lib/invoice-reference";
import { money, shortDate } from "@/lib/portal-format";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { createClient } from "@/lib/supabase/server";
import { serviceSelect } from "@/lib/supabase-rpc";

function paymentDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AccountPage() {
  await requireCustomerPortal();
  const context = await requireAuth();
  const locale = await getRequestLocale();
  const c = portalCopy[locale].dashboard;
  const db = await createClient();
  const customerId =
    context.customerId || "00000000-0000-0000-0000-000000000000";

  const [
    customer,
    properties,
    subscriptions,
    invoices,
    serviceBookings,
    additionalServices,
  ] = await Promise.all([
    db
      .from("customers")
      .select("full_name,status")
      .eq("id", customerId)
      .maybeSingle(),
    db
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId),
    db
      .from("subscriptions")
      .select(
        "id,status,billing_interval,billed_price_cents,currency,current_period_end,first_payment_scheduled_for,renewal_payment_due_at",
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    db
      .from("invoices")
      .select(
        "id,invoice_number,stripe_invoice_id,status,amount_due_cents,amount_paid_cents,currency,due_at,period_start,created_at,invoice_pdf_url,receipt_url,subscription_id,invoice_type",
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("service_bookings")
      .select(
        "id,status,service_window_start,service_window_end,scheduled_start",
      )
      .eq("customer_id", customerId)
      .in("status", ["planning", "confirmed"])
      .order("service_window_start", { ascending: true }),
    db
      .from("deep_clean_requests")
      .select(
        "id,status,requested_date,is_free,price_cents,currency,payment_status",
      )
      .eq("customer_id", customerId)
      .in("status", ["submitted", "under_review", "approved", "scheduled"])
      .order("requested_date", { ascending: true }),
  ]);

  const now = new Date();
  const subscriptionRows = (subscriptions.data || []) as OverviewSubscription[];
  const invoiceRows = (invoices.data || []) as OverviewInvoice[];
  const counts = countSubscriptions(subscriptionRows);
  const nextMonthlyPayment = selectNextPayment(
    subscriptionRows,
    "monthly",
    now,
  );
  const nextAnnualPayment = selectNextPayment(
    subscriptionRows,
    "annual",
    now,
  );
  const currentInvoice = selectCurrentMonthInvoice(invoiceRows, now);
  const outstanding = summarizeOutstandingInvoices(invoiceRows);
  const upcomingMaintenance = selectUpcomingMaintenance(
    (serviceBookings.data || []) as OverviewServiceBooking[],
    now,
  );
  const upcomingAdditionalService = selectUpcomingAdditionalService(
    (additionalServices.data || []) as OverviewAdditionalService[],
    now,
  );

  let activePaymentToken: string | undefined;
  if (outstanding.paymentInvoice) {
    try {
      const [paymentLink] = await serviceSelect<{ token: string }[]>(
        `payment_links?invoice_id=eq.${outstanding.paymentInvoice.id}&status=eq.active&expires_at=gt.${encodeURIComponent(now.toISOString())}&order=created_at.desc&select=token&limit=1`,
      );
      activePaymentToken = paymentLink?.token;
    } catch {
      // The invoices page remains the safe fallback when no active link exists
      // or service-role access is not configured in a local environment.
    }
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground">{c.welcome}</p>
      <h1 className="mt-1 font-serif text-4xl">
        {customer.data?.full_name || c.title}
      </h1>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PortalCard title={c.accountStatus}>
          <StatusBadge
            value={
              customer.data?.status || context.customerStatus || "applicant"
            }
          />
        </PortalCard>

        <PortalCard title={c.propertiesTotal}>
          <p className="font-serif text-3xl">{properties.count || 0}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {c.propertiesTotal}
          </p>
        </PortalCard>

        <PortalCard title={c.subscriptionsSummary}>
          <dl className="grid grid-cols-3 gap-3">
            {[
              [c.monthly, counts.monthly],
              [c.annual, counts.annual],
              [c.paused, counts.paused],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl bg-secondary/60 p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-serif text-2xl">{value}</dd>
              </div>
            ))}
          </dl>
        </PortalCard>

        <PortalCard title={c.nextPayment}>
          <div className="space-y-4">
            <PaymentSummary
              label={c.nextMonthlyPayment}
              payment={nextMonthlyPayment}
              emptyLabel={c.noPaymentScheduled}
              locale={locale}
            />
            <PaymentSummary
              label={c.nextAnnualPayment}
              payment={nextAnnualPayment}
              emptyLabel={c.noPaymentScheduled}
              locale={locale}
            />
          </div>
        </PortalCard>

        <PortalCard title={c.upcomingService}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {c.maintenanceService}
              </p>
              {upcomingMaintenance ? (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge value={upcomingMaintenance.status} />
                    <span className="text-sm font-medium text-primary">
                      {c.includedInSubscription}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">
                    {upcomingMaintenance.scheduled_start
                      ? shortDate(upcomingMaintenance.scheduled_start, locale)
                      : `${shortDate(
                          upcomingMaintenance.service_window_start,
                          locale,
                        )} – ${shortDate(
                          upcomingMaintenance.service_window_end,
                          locale,
                        )}`}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{c.empty}</p>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {c.additionalService}
              </p>
              {upcomingAdditionalService ? (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge value={upcomingAdditionalService.status} />
                    <span className="text-sm font-semibold">
                      {upcomingAdditionalService.is_free
                        ? c.free
                        : money(
                            upcomingAdditionalService.price_cents,
                            upcomingAdditionalService.currency,
                            locale,
                          )}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">
                    {shortDate(
                      upcomingAdditionalService.requested_date,
                      locale,
                    )}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{c.empty}</p>
              )}
            </div>
          </div>
        </PortalCard>

        <PortalCard title={c.latestInvoice}>
          {currentInvoice ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusBadge value={currentInvoice.status} />
                <p className="font-serif text-2xl">
                  {money(
                    currentInvoice.amount_due_cents,
                    currentInvoice.currency,
                    locale,
                  )}
                </p>
              </div>
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">{c.reference}</dt>
                  <dd className="font-medium">
                    {compactInvoiceReference(
                      currentInvoice.invoice_number ||
                        currentInvoice.stripe_invoice_id,
                      currentInvoice.id,
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">{c.date}</dt>
                  <dd>{shortDate(currentInvoice.created_at, locale)}</dd>
                </div>
              </dl>
              <Link
                href={`/api/account/invoices/${currentInvoice.id}/download?kind=invoice`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "mt-4",
                })}
              >
                {c.download}
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {c.noInvoiceThisMonth}
            </p>
          )}
        </PortalCard>

        <PortalCard title={c.balance}>
          <p className="font-serif text-3xl">
            {money(outstanding.totalCents, outstanding.currency, locale)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {outstanding.count
              ? `${outstanding.count} ${c.outstandingInvoices.toLocaleLowerCase(
                  locale,
                )}`
              : c.noOutstandingBalance}
          </p>
          {outstanding.count > 0 ? (
            <Link
              href={
                activePaymentToken
                  ? `/api/account/invoices/pay-link/${activePaymentToken}`
                  : "/account/invoices"
              }
              className={buttonVariants({ size: "sm", className: "mt-4" })}
            >
              {activePaymentToken ? c.payNow : c.viewInvoices}
            </Link>
          ) : null}
        </PortalCard>
      </div>
    </div>
  );
}

function PaymentSummary({
  label,
  payment,
  emptyLabel,
  locale,
}: {
  label: string;
  payment: ReturnType<typeof selectNextPayment>;
  emptyLabel: string;
  locale: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {payment ? (
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-sm">{paymentDate(payment.date, locale)}</p>
          <p className="font-semibold">
            {money(
              payment.subscription.billed_price_cents,
              payment.subscription.currency,
              locale,
            )}
          </p>
        </div>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </div>
  );
}
