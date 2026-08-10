import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PortalCard, StatusBadge } from "@/components/portal/portal-shell";
import { portalCopy, type PortalCopy } from "@/i18n/portal-copy";
import {
  countSubscriptions,
  countSuspendedForPayment,
  excludeSuspendedBookings,
  isBlockedForPayment,
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
import {
  appointmentDisplayState,
  appointmentTiming,
  isOnDay,
  nextAppointment,
} from "@/lib/appointment-state";
import { requireCustomerPortal } from "@/lib/feature-flags";
import { compactInvoiceReference } from "@/lib/invoice-reference";
import { money, shortDate } from "@/lib/portal-format";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { createClient } from "@/lib/supabase/server";

type NextAppointmentProperty = { id: string; address_line1: string; city: string };
type NextAppointmentRow = {
  id: string;
  status: string;
  service_window_start: string;
  service_window_end: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  property_id: string;
  subscription_id: string;
  properties: NextAppointmentProperty[] | NextAppointmentProperty | null;
};

/** A subscription row plus the property it serves, for naming it to the customer. */
type SubscriptionWithProperty = OverviewSubscription & {
  properties?: NextAppointmentProperty[] | NextAppointmentProperty | null;
};

function subscriptionPropertyLabel(subscription: SubscriptionWithProperty): string | null {
  const property = Array.isArray(subscription.properties)
    ? subscription.properties[0]
    : subscription.properties;
  return property ? `${property.address_line1}, ${property.city}` : null;
}

function propertyLabel(booking: NextAppointmentRow): string | null {
  const property = Array.isArray(booking.properties)
    ? booking.properties[0]
    : booking.properties;
  return property ? `${property.address_line1}, ${property.city}` : null;
}

/** "Mon 17 Aug, 09:00 – 11:30" for a booking with a confirmed slot. */
function appointmentDateTime(start: string, end: string | null, locale: string) {
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(start));
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  const window = end ? `${time.format(new Date(start))} – ${time.format(new Date(end))}` : time.format(new Date(start));
  return `${date}, ${window}`;
}

/**
 * The tile's footer. While a subscription is suspended for non-payment there is
 * no point sending the customer to an agenda that cannot move, so the agenda
 * link is replaced by the action that unblocks them.
 *
 * It goes to the invoices page rather than straight into Stripe: the customer
 * should see what is owed, for which period, before a payment form opens. The
 * unpaid row there carries its own Pay now button.
 */
function AppointmentTileAction({
  blocked,
  copy,
}: {
  blocked: boolean;
  copy: PortalCopy["appointments"];
}) {
  if (!blocked) {
    return (
      <Link
        href="/account/appointments?view=agenda"
        className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}
      >
        {copy.viewAgenda}
      </Link>
    );
  }
  return (
    <>
      {/* Explanation only. Paying happens on the Account status tile, which
          carries the balance the payment settles. */}
      <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
        {copy.blockedNote}
      </p>
    </>
  );
}

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
  const ac = portalCopy[locale].appointments;
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
    appointmentBookings,
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
        "id,status,billing_interval,billed_price_cents,currency,current_period_end,first_payment_scheduled_for,renewal_payment_due_at,operational_status,properties(address_line1,city)",
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
    // Separate from `serviceBookings` above on purpose: the Next-appointment
    // tile needs the property and must include `in_progress` (a visit happening
    // right now is the most relevant thing on the page), while
    // selectUpcomingMaintenance's planning/confirmed-only input is left alone.
    db
      .from("service_bookings")
      .select(
        "id,status,service_window_start,service_window_end,scheduled_start,scheduled_end,property_id,subscription_id,properties(id,address_line1,city)",
      )
      .eq("customer_id", customerId)
      .in("status", ["planning", "confirmed", "in_progress"])
      .order("service_window_start", { ascending: true }),
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
  const suspendedSubscriptions = (subscriptionRows as SubscriptionWithProperty[]).filter(
    (subscription) => subscription.operational_status === "suspended_for_non_payment",
  );
  const suspendedCount = countSuspendedForPayment(subscriptionRows);
  const blockedForPayment = isBlockedForPayment(subscriptionRows);

  const nextVisit = nextAppointment(
    excludeSuspendedBookings(
      (appointmentBookings.data || []) as NextAppointmentRow[],
      subscriptionRows,
    ),
    now,
  );
  const upcomingAdditionalService = selectUpcomingAdditionalService(
    (additionalServices.data || []) as OverviewAdditionalService[],
    now,
  );

  return (
    <div>
      <p className="text-sm text-muted-foreground">{c.welcome}</p>
      <h1 className="mt-1 font-serif text-4xl">
        {customer.data?.full_name || c.title}
      </h1>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/*
          Named per property, not just counted. With several properties the
          customer's first question is which one is affected, and an address
          answers that where "1 subscription" does not.
        */}
        {suspendedSubscriptions.length ? (
          <PortalCard title={c.suspendedTitle}>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              {(suspendedCount === 1 ? c.subscriptionSuspended : c.subscriptionsSuspended).replace(
                "{count}",
                String(suspendedCount),
              )}
            </p>
            <ul className="mt-3 space-y-2">
              {suspendedSubscriptions.map((subscription) => (
                <li
                  key={subscription.id}
                  className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400"
                >
                  {subscriptionPropertyLabel(subscription) || c.subscription}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">{c.othersContinue}</p>
          </PortalCard>
        ) : null}

        <PortalCard title={ac.nextTitle}>
          {nextVisit ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={ac.states[appointmentDisplayState(nextVisit, now)]} />
                {isOnDay(nextVisit, now) ? (
                  <span className="inline-flex rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                    {ac.today}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 font-serif text-2xl">
                {nextVisit.scheduled_start
                  ? appointmentDateTime(nextVisit.scheduled_start, nextVisit.scheduled_end, locale)
                  : `${shortDate(nextVisit.service_window_start, locale)} – ${shortDate(
                      nextVisit.service_window_end,
                      locale,
                    )}`}
              </p>
              {appointmentTiming(nextVisit) === "window" ? (
                <p className="mt-1 text-sm text-muted-foreground">{ac.timeToBeConfirmed}</p>
              ) : null}
              <p className="mt-2 text-sm text-muted-foreground">
                {propertyLabel(nextVisit) || c.property}
              </p>
              {/* Only claim scheduling is on hold when nothing is actually
                  running. With one property suspended and two still active,
                  the note would contradict the appointment shown above it. */}
              <AppointmentTileAction blocked={blockedForPayment && !nextVisit} copy={ac} />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{ac.emptyUpcoming}</p>
              {/* Only claim scheduling is on hold when nothing is actually
                  running. With one property suspended and two still active,
                  the note would contradict the appointment shown above it. */}
              <AppointmentTileAction blocked={blockedForPayment && !nextVisit} copy={ac} />
            </>
          )}
        </PortalCard>

        {/*
          Status, what is wrong, what is owed, and the way to fix it, in one
          place. Splitting the balance into its own tile meant the amount and
          the reason for it sat apart, and the customer had to join them up.
        */}
        <PortalCard title={c.accountStatus}>
          <StatusBadge
            value={
              customer.data?.status || context.customerStatus || "applicant"
            }
          />

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">{c.balance}</p>
            <p className="mt-0.5 font-serif text-3xl">
              {money(outstanding.totalCents, outstanding.currency, locale)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {outstanding.count
                ? `${outstanding.count} ${c.outstandingInvoices.toLocaleLowerCase(locale)}`
                : c.noOutstandingBalance}
            </p>
            {outstanding.count > 0 ? (
              <Link
                href="/account/invoices"
                className={buttonVariants({ variant: "danger", size: "sm", className: "mt-4" })}
              >
                {c.payNow}
              </Link>
            ) : null}
          </div>
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
