import assert from "node:assert/strict";
import test from "node:test";
import {
  countSubscriptions,
  selectCurrentMonthInvoice,
  selectNextPayment,
  selectUpcomingAdditionalService,
  selectUpcomingMaintenance,
  summarizeOutstandingInvoices,
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
