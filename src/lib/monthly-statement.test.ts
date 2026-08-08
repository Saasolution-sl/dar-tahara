import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMonthlyStatements, buildStatementDiscountBreakdown, type MonthlyUnit, type MonthlyInvoiceLine, type StatementLine } from "./monthly-statement";

const units: MonthlyUnit[] = [
  { subscriptionId: "a", propertyLabel: "Unit A", frequency: "weekly", status: "active", createdAt: "2026-05-01T00:00:00Z" },
  { subscriptionId: "b", propertyLabel: "Unit B", frequency: "biweekly", status: "paused", createdAt: "2026-05-01T00:00:00Z" },
  { subscriptionId: "c", propertyLabel: "Unit C", frequency: "monthly", status: "active", createdAt: "2026-07-01T00:00:00Z" },
];

test("groups invoices by calendar month, most recent first", () => {
  const invoices: MonthlyInvoiceLine[] = [
    { subscriptionId: "a", periodStart: "2026-06-01T00:00:00Z", amountCents: 10000, currency: "eur" },
    { subscriptionId: "a", periodStart: "2026-07-01T00:00:00Z", amountCents: 10000, currency: "eur" },
  ];
  const statements = buildMonthlyStatements(units, invoices);
  assert.deepEqual(statements.map((s) => s.monthKey), ["2026-07", "2026-06"]);
});

test("a unit with no invoice that month appears as on hold, never omitted", () => {
  const invoices: MonthlyInvoiceLine[] = [
    { subscriptionId: "a", periodStart: "2026-06-01T00:00:00Z", amountCents: 10000, currency: "eur" },
  ];
  const statements = buildMonthlyStatements(units, invoices);
  const june = statements[0];
  assert.equal(june.monthKey, "2026-06");
  const unitB = june.lines.find((l) => l.subscriptionId === "b");
  assert.ok(unitB);
  assert.equal(unitB?.onHold, true);
  assert.equal(unitB?.amountCents, 0);
});

test("a unit created after the statement month is not shown at all (didn't exist yet)", () => {
  const invoices: MonthlyInvoiceLine[] = [
    { subscriptionId: "a", periodStart: "2026-06-01T00:00:00Z", amountCents: 10000, currency: "eur" },
  ];
  const statements = buildMonthlyStatements(units, invoices);
  const june = statements[0];
  assert.equal(june.lines.some((l) => l.subscriptionId === "c"), false);
});

test("total is the sum of only the charged (non-on-hold) lines", () => {
  const invoices: MonthlyInvoiceLine[] = [
    { subscriptionId: "a", periodStart: "2026-06-01T00:00:00Z", amountCents: 10000, currency: "eur" },
    { subscriptionId: "b", periodStart: "2026-06-01T00:00:00Z", amountCents: 5000, currency: "eur" },
  ];
  const statements = buildMonthlyStatements(units, invoices);
  assert.equal(statements[0].totalCents, 15000);
});

test("no invoices produces no statements", () => {
  assert.deepEqual(buildMonthlyStatements(units, []), []);
});

test("a real invoice always shows, even if the subscription's own createdAt is (implausibly) after the invoice's month", () => {
  // Regression: unit C's createdAt (2026-07) is after June, but it has a real
  // June invoice, the invoice is evidence it existed, so it must still show
  // rather than being silently dropped by the "didn't exist yet" filter.
  const invoices: MonthlyInvoiceLine[] = [
    { subscriptionId: "c", periodStart: "2026-06-01T00:00:00Z", amountCents: 8000, currency: "eur" },
  ];
  const statements = buildMonthlyStatements(units, invoices);
  const june = statements[0];
  const unitC = june.lines.find((l) => l.subscriptionId === "c");
  assert.ok(unitC);
  assert.equal(unitC?.onHold, false);
  assert.equal(unitC?.amountCents, 8000);
});

test("discount breakdown reverses the frequency discount and reads the duration discount back out, reconciling exactly to the charged total", () => {
  const lines: StatementLine[] = [
    // biweekly = 15% frequency discount. Pre-duration (post-frequency) price 15_300,
    // actually charged 13_005 (12-month tier, 15% duration discount off the 3-month anchor).
    { subscriptionId: "a", propertyLabel: "Unit A", frequency: "biweekly", onHold: false, amountCents: 13_005, originalPriceCents: 15_300 },
    // monthly = 0% frequency discount, no duration ever selected (legacy), no discount recoverable.
    { subscriptionId: "b", propertyLabel: "Unit B", frequency: "monthly", onHold: false, amountCents: 9_000, originalPriceCents: null },
    // on hold, excluded entirely from the breakdown.
    { subscriptionId: "c", propertyLabel: "Unit C", frequency: "weekly", onHold: true, amountCents: 0, originalPriceCents: 38_400 },
  ];
  const breakdown = buildStatementDiscountBreakdown(lines);
  // Unit A: true list = 15_300 / 0.85 = 18_000. Frequency discount = 18_000 - 15_300 = 2_700. Duration discount = 15_300 - 13_005 = 2_295.
  // Unit B: no recoverable discount, list = charged = 9_000.
  assert.equal(breakdown.subtotalCents, 18_000 + 9_000);
  assert.equal(breakdown.frequencyDiscountCents, 2_700);
  assert.equal(breakdown.durationDiscountCents, 2_295);
  const total = lines.filter((l) => !l.onHold).reduce((sum, l) => sum + l.amountCents, 0);
  assert.equal(breakdown.subtotalCents - breakdown.frequencyDiscountCents - breakdown.durationDiscountCents, total);
});

test("discount breakdown returns zero for an empty or fully-on-hold set of lines", () => {
  assert.deepEqual(buildStatementDiscountBreakdown([]), { subtotalCents: 0, frequencyDiscountCents: 0, durationDiscountCents: 0 });
  const onlyOnHold: StatementLine[] = [{ subscriptionId: "a", propertyLabel: "Unit A", frequency: "weekly", onHold: true, amountCents: 0, originalPriceCents: 38_400 }];
  assert.deepEqual(buildStatementDiscountBreakdown(onlyOnHold), { subtotalCents: 0, frequencyDiscountCents: 0, durationDiscountCents: 0 });
});
