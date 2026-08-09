import assert from "node:assert/strict";
import test from "node:test";
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
  suspendedSubscriptionIds,
  type OverviewInvoice,
  type OverviewSubscription,
} from "./account-overview";

const now = new Date("2026-07-30T10:00:00.000Z");

function subscription(
  overrides: Partial<OverviewSubscription>,
): OverviewSubscription {
  return {
    id: "subscription",
    status: "active",
    billing_interval: "monthly",
    billed_price_cents: 28000,
    currency: "eur",
    current_period_end: "2026-08-28T08:00:00.000Z",
    first_payment_scheduled_for: null,
    renewal_payment_due_at: null,
    ...overrides,
  };
}

function invoice(overrides: Partial<OverviewInvoice>): OverviewInvoice {
  return {
    id: "invoice",
    invoice_number: "INV-2026-0001",
    stripe_invoice_id: null,
    status: "paid",
    amount_due_cents: 28000,
    amount_paid_cents: 28000,
    currency: "eur",
    due_at: "2026-07-31T08:00:00.000Z",
    period_start: "2026-07-01T00:00:00.000Z",
    created_at: "2026-07-01T00:00:00.000Z",
    invoice_pdf_url: null,
    receipt_url: null,
    subscription_id: "subscription",
    invoice_type: "standard",
    ...overrides,
  };
}

test("counts monthly and annual subscriptions while also reporting paused", () => {
  assert.deepEqual(
    countSubscriptions([
      subscription({ id: "monthly" }),
      subscription({
        id: "annual",
        billing_interval: "annual",
        status: "paused",
      }),
      subscription({ id: "cancelled", status: "cancelled" }),
    ]),
    { monthly: 1, annual: 1, paused: 1 },
  );
});

test("selects the first upcoming monthly Friday and annual renewal separately", () => {
  const subscriptions = [
    subscription({
      id: "monthly",
      first_payment_scheduled_for: "2026-07-31T08:00:00.000Z",
      current_period_end: null,
    }),
    subscription({
      id: "annual",
      billing_interval: "annual",
      billed_price_cents: 319200,
      renewal_payment_due_at: "2027-07-23T08:00:00.000Z",
      current_period_end: "2027-07-30T08:00:00.000Z",
    }),
  ];

  assert.equal(
    selectNextPayment(subscriptions, "monthly", now)?.date,
    "2026-07-31T08:00:00.000Z",
  );
  assert.equal(
    selectNextPayment(subscriptions, "annual", now)?.date,
    "2027-07-23T08:00:00.000Z",
  );
});

test("shows an actionable current-month invoice before a paid invoice", () => {
  const selected = selectCurrentMonthInvoice(
    [
      invoice({ id: "paid", created_at: "2026-07-29T00:00:00.000Z" }),
      invoice({
        id: "open",
        status: "open",
        amount_paid_cents: 0,
        created_at: "2026-07-10T00:00:00.000Z",
      }),
      invoice({
        id: "previous-month",
        period_start: "2026-06-01T00:00:00.000Z",
      }),
    ],
    now,
  );

  assert.equal(selected?.id, "open");
});

test("totals every open and overdue invoice and prioritizes overdue payment", () => {
  const summary = summarizeOutstandingInvoices([
    invoice({
      id: "open",
      status: "open",
      amount_due_cents: 28000,
      amount_paid_cents: 4000,
    }),
    invoice({
      id: "overdue",
      status: "overdue",
      amount_due_cents: 10000,
      amount_paid_cents: 0,
    }),
    invoice({ id: "paid" }),
  ]);

  assert.equal(summary.totalCents, 34000);
  assert.equal(summary.count, 2);
  assert.equal(summary.paymentInvoice?.id, "overdue");
});

test("selects upcoming maintenance and additional service dates", () => {
  assert.equal(
    selectUpcomingMaintenance(
      [
        {
          id: "old",
          status: "completed",
          service_window_start: "2026-07-01",
          service_window_end: "2026-07-07",
          scheduled_start: null,
        },
        {
          id: "next",
          status: "planning",
          service_window_start: "2026-08-03",
          service_window_end: "2026-08-09",
          scheduled_start: null,
        },
      ],
      now,
    )?.id,
    "next",
  );
  assert.equal(
    selectUpcomingAdditionalService(
      [
        {
          id: "deep-clean",
          status: "scheduled",
          requested_date: "2026-08-05",
          is_free: false,
          price_cents: 56000,
          currency: "eur",
          payment_status: "paid",
        },
      ],
      now,
    )?.id,
    "deep-clean",
  );
});

test("a subscription suspended for non-payment blocks scheduling", () => {
  assert.equal(
    isBlockedForPayment([
      subscription({ id: "a" }),
      subscription({ id: "b", operational_status: "suspended_for_non_payment" }),
    ]),
    true,
  );
});

test("cancellation_pending does not block: paying would not clear it", () => {
  assert.equal(
    isBlockedForPayment([subscription({ operational_status: "cancellation_pending" })]),
    false,
  );
});

test("active subscriptions, a missing status, and no subscriptions are all unblocked", () => {
  assert.equal(isBlockedForPayment([subscription({ operational_status: "active" })]), false);
  assert.equal(isBlockedForPayment([subscription({})]), false);
  assert.equal(isBlockedForPayment([subscription({ operational_status: null })]), false);
  assert.equal(isBlockedForPayment([]), false);
});

test("a paused subscription is not blocked unless it is also suspended for non-payment", () => {
  assert.equal(isBlockedForPayment([subscription({ status: "paused" })]), false);
  assert.equal(
    isBlockedForPayment([
      subscription({ status: "paused", operational_status: "suspended_for_non_payment" }),
    ]),
    true,
  );
});

test("counts how many subscriptions are suspended, not just whether any are", () => {
  assert.equal(
    countSuspendedForPayment([
      subscription({ id: "a", operational_status: "suspended_for_non_payment" }),
      subscription({ id: "b", operational_status: "suspended_for_non_payment" }),
      subscription({ id: "c" }),
      subscription({ id: "d", operational_status: "cancellation_pending" }),
    ]),
    2,
  );
  assert.equal(countSuspendedForPayment([subscription({})]), 0);
  assert.equal(countSuspendedForPayment([]), 0);
});

test("bookings on a suspended subscription are dropped, the rest survive", () => {
  const subscriptions = [
    subscription({ id: "tangier", operational_status: "suspended_for_non_payment" }),
    subscription({ id: "rabat" }),
    subscription({ id: "casablanca", operational_status: "active" }),
  ];
  const bookings = [
    { id: "a", subscription_id: "tangier" },
    { id: "b", subscription_id: "rabat" },
    { id: "c", subscription_id: "casablanca" },
    { id: "d", subscription_id: "tangier" },
  ];

  assert.deepEqual(
    excludeSuspendedBookings(bookings, subscriptions).map((booking) => booking.id),
    ["b", "c"],
  );
});

test("with nothing suspended every booking is kept", () => {
  const bookings = [{ id: "a", subscription_id: "rabat" }];
  assert.deepEqual(excludeSuspendedBookings(bookings, [subscription({ id: "rabat" })]), bookings);
  assert.deepEqual(excludeSuspendedBookings(bookings, []), bookings);
});

test("a booking whose subscription is unknown is kept, not silently hidden", () => {
  const bookings = [{ id: "orphan", subscription_id: "not-in-the-list" }];
  assert.deepEqual(
    excludeSuspendedBookings(bookings, [
      subscription({ id: "tangier", operational_status: "suspended_for_non_payment" }),
    ]),
    bookings,
  );
});

test("excludeSuspendedBookings does not mutate the caller's array", () => {
  const bookings = [
    { id: "a", subscription_id: "tangier" },
    { id: "b", subscription_id: "rabat" },
  ];
  excludeSuspendedBookings(bookings, [
    subscription({ id: "tangier", operational_status: "suspended_for_non_payment" }),
  ]);
  assert.equal(bookings.length, 2);
});

test("suspendedSubscriptionIds returns only the suspended ones", () => {
  const ids = suspendedSubscriptionIds([
    subscription({ id: "tangier", operational_status: "suspended_for_non_payment" }),
    subscription({ id: "rabat" }),
    subscription({ id: "casablanca", operational_status: "cancellation_pending" }),
  ]);

  assert.equal(ids.has("tangier"), true);
  assert.equal(ids.has("rabat"), false);
  assert.equal(ids.has("casablanca"), false);
  assert.equal(ids.size, 1);
});
