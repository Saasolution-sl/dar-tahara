export type OverviewSubscription = {
  id: string;
  status: string;
  billing_interval: "monthly" | "annual";
  billed_price_cents: number;
  currency: string;
  current_period_end: string | null;
  first_payment_scheduled_for: string | null;
  renewal_payment_due_at: string | null;
  /**
   * 'active' | 'suspended_for_non_payment' | 'cancellation_pending'. Optional
   * because the existing selectors here never needed it and their fixtures do
   * not set it; the overview page selects it to decide whether scheduling is
   * blocked on an unpaid invoice.
   */
  operational_status?: string | null;
};

export type OverviewInvoice = {
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
};

export type OverviewServiceBooking = {
  id: string;
  status: string;
  service_window_start: string;
  service_window_end: string;
  scheduled_start: string | null;
};

export type OverviewAdditionalService = {
  id: string;
  status: string;
  requested_date: string;
  is_free: boolean;
  price_cents: number;
  currency: string;
  payment_status: string;
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "pending_payment",
  "active",
  "past_due",
  "paused",
]);
const FUTURE_PAYMENT_STATUSES = new Set(["pending_payment", "active"]);
const OUTSTANDING_INVOICE_STATUSES = new Set(["open", "overdue"]);
const CURRENT_INVOICE_STATUS_PRIORITY = [
  "overdue",
  "open",
  "draft",
  "paid",
  "partially_refunded",
  "refunded",
  "uncollectible",
  "void",
];

function timestamp(value: string | null | undefined) {
  if (!value) return Number.NaN;
  return new Date(value).getTime();
}

function isOnOrAfter(value: string | null | undefined, asOf: Date) {
  const valueTime = timestamp(value);
  return Number.isFinite(valueTime) && valueTime >= asOf.getTime();
}

function earliestFutureDate(
  values: Array<string | null | undefined>,
  asOf: Date,
) {
  return values
    .filter((value): value is string => isOnOrAfter(value, asOf))
    .sort((left, right) => timestamp(left) - timestamp(right))[0] || null;
}

export function countSubscriptions(subscriptions: OverviewSubscription[]) {
  const current = subscriptions.filter((subscription) =>
    ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status),
  );

  return {
    monthly: current.filter(
      (subscription) => subscription.billing_interval === "monthly",
    ).length,
    annual: current.filter(
      (subscription) => subscription.billing_interval === "annual",
    ).length,
    paused: current.filter((subscription) => subscription.status === "paused")
      .length,
  };
}

export function selectNextPayment(
  subscriptions: OverviewSubscription[],
  billingInterval: "monthly" | "annual",
  asOf = new Date(),
) {
  return subscriptions
    .filter(
      (subscription) =>
        subscription.billing_interval === billingInterval &&
        FUTURE_PAYMENT_STATUSES.has(subscription.status),
    )
    .map((subscription) => {
      const date =
        billingInterval === "monthly"
          ? earliestFutureDate(
              [
                subscription.first_payment_scheduled_for,
                subscription.current_period_end,
              ],
              asOf,
            )
          : earliestFutureDate(
              [
                subscription.renewal_payment_due_at,
                subscription.current_period_end,
              ],
              asOf,
            );

      return date ? { subscription, date } : null;
    })
    .filter(
      (
        candidate,
      ): candidate is { subscription: OverviewSubscription; date: string } =>
        Boolean(candidate),
    )
    .sort(
      (left, right) => timestamp(left.date) - timestamp(right.date),
    )[0] || null;
}

function invoiceMonth(invoice: OverviewInvoice) {
  return (invoice.period_start || invoice.created_at).slice(0, 7);
}

function monthKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

export function selectCurrentMonthInvoice(
  invoices: OverviewInvoice[],
  asOf = new Date(),
) {
  const currentMonth = monthKey(asOf);

  return (
    invoices
      .filter((invoice) => invoiceMonth(invoice) === currentMonth)
      .sort((left, right) => {
        const leftPriority = CURRENT_INVOICE_STATUS_PRIORITY.indexOf(left.status);
        const rightPriority = CURRENT_INVOICE_STATUS_PRIORITY.indexOf(
          right.status,
        );
        const normalizedLeft =
          leftPriority === -1 ? CURRENT_INVOICE_STATUS_PRIORITY.length : leftPriority;
        const normalizedRight =
          rightPriority === -1
            ? CURRENT_INVOICE_STATUS_PRIORITY.length
            : rightPriority;

        return (
          normalizedLeft - normalizedRight ||
          timestamp(right.created_at) - timestamp(left.created_at)
        );
      })[0] || null
  );
}

export function summarizeOutstandingInvoices(invoices: OverviewInvoice[]) {
  const outstanding = invoices
    .map((invoice) => ({
      invoice,
      remainingCents: Math.max(
        0,
        invoice.amount_due_cents - invoice.amount_paid_cents,
      ),
    }))
    .filter(
      ({ invoice, remainingCents }) =>
        OUTSTANDING_INVOICE_STATUSES.has(invoice.status) && remainingCents > 0,
    )
    .sort((left, right) => {
      if (left.invoice.status !== right.invoice.status) {
        return left.invoice.status === "overdue" ? -1 : 1;
      }
      return (
        timestamp(left.invoice.due_at) - timestamp(right.invoice.due_at) ||
        timestamp(left.invoice.created_at) - timestamp(right.invoice.created_at)
      );
    });

  const currency = outstanding[0]?.invoice.currency || "EUR";
  const sameCurrency = outstanding.filter(
    ({ invoice }) => invoice.currency.toUpperCase() === currency.toUpperCase(),
  );

  return {
    count: sameCurrency.length,
    totalCents: sameCurrency.reduce(
      (total, item) => total + item.remainingCents,
      0,
    ),
    currency,
    paymentInvoice: sameCurrency[0]?.invoice || null,
  };
}

/**
 * Whether scheduling is blocked on money the customer still owes.
 *
 * Only `suspended_for_non_payment` counts. `cancellation_pending` is also a
 * non-active operational state, but paying does not clear it, so offering a
 * "pay now" action there would send the customer down a dead end.
 *
 * `operational_status` is optional on the type (older fixtures predate the
 * column), and a missing value is treated as not blocked - the safe direction,
 * since a false positive would hide a customer's appointments behind a payment
 * demand they may not owe.
 */
export function countSuspendedForPayment(subscriptions: OverviewSubscription[]): number {
  return subscriptions.filter(
    (subscription) => subscription.operational_status === "suspended_for_non_payment",
  ).length;
}

export function isBlockedForPayment(subscriptions: OverviewSubscription[]): boolean {
  return countSuspendedForPayment(subscriptions) > 0;
}

/**
 * Drops the bookings belonging to subscriptions suspended for non-payment.
 *
 * Suspension is per subscription, not per account: a customer with three
 * properties and one unpaid invoice still has two being cleaned, and the
 * overview must keep showing those. A booking whose subscription is not in the
 * list at all is kept rather than dropped - hiding a real appointment because
 * its subscription could not be matched would be the worse failure.
 */
export function excludeSuspendedBookings<T extends { subscription_id: string }>(
  bookings: T[],
  subscriptions: OverviewSubscription[],
): T[] {
  const suspended = suspendedSubscriptionIds(subscriptions);
  return bookings.filter((booking) => !suspended.has(booking.subscription_id));
}

/**
 * Ids of the subscriptions suspended for non-payment.
 *
 * The overview uses this to drop those bookings; the appointments calendar uses
 * it to mark them instead, since there the customer needs to see which visits
 * are affected rather than have them disappear.
 */
export function suspendedSubscriptionIds(
  subscriptions: OverviewSubscription[],
): ReadonlySet<string> {
  return new Set(
    subscriptions
      .filter((subscription) => subscription.operational_status === "suspended_for_non_payment")
      .map((subscription) => subscription.id),
  );
}

export function selectUpcomingMaintenance(
  bookings: OverviewServiceBooking[],
  asOf = new Date(),
) {
  const today = monthDateKey(asOf);
  return (
    bookings
      .filter(
        (booking) =>
          booking.status !== "cancelled" &&
          (booking.scheduled_start || booking.service_window_end).slice(0, 10) >=
            today,
      )
      .sort((left, right) => {
        const leftDate = left.scheduled_start || left.service_window_start;
        const rightDate = right.scheduled_start || right.service_window_start;
        return timestamp(leftDate) - timestamp(rightDate);
      })[0] || null
  );
}

function monthDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function selectUpcomingAdditionalService(
  services: OverviewAdditionalService[],
  asOf = new Date(),
) {
  const today = monthDateKey(asOf);
  return (
    services
      .filter(
        (service) =>
          ["submitted", "under_review", "approved", "scheduled"].includes(
            service.status,
          ) && service.requested_date >= today,
      )
      .sort((left, right) =>
        left.requested_date.localeCompare(right.requested_date),
      )[0] || null
  );
}
