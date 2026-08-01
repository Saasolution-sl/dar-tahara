import assert from "node:assert/strict";
import { test } from "node:test";
import { compactInvoiceReference } from "./invoice-reference";

test("compact references remove document letters and the year", () => {
  assert.equal(compactInvoiceReference("INV-2026-000043", "fallback"), "000043");
  assert.equal(
    compactInvoiceReference("STMT-2026-07-51FA72A1", "fallback"),
    "0751721",
  );
});

test("compact references fall back to numeric characters from the stable id", () => {
  assert.equal(
    compactInvoiceReference(
      "EXAMPLE-ETS-MONTHLY-2026",
      "94732096-c5ff-43f7-91c0-2f7161027f77",
    ),
    "94732096",
  );
});

test("compact references never expose letters", () => {
  assert.equal(compactInvoiceReference("ETS-2026-ABCDEF", "a1b2c3d4"), "1234");
});
