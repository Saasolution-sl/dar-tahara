import { test } from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { generateInvoicePdf, type InvoicePdfInput } from "./generate-invoice-pdf";

const baseInput: InvoicePdfInput = {
  docType: "Statement",
  number: "STMT-2026-07-TESTCUST",
  date: "29 Jul 2026",
  reference: "July 2026",
  accent: "#2f4c32",
  from: { name: "Dar Tahara", lines: ["Tangier, Morocco", "hello@dartahara.com"] },
  to: { name: "Test Customer", lines: ["customer.test@dartahara.local"] },
  items: [
    { description: "12 Rue des Oliviers, Tangier - Biweekly", qty: 1, rate: 2052 },
    { description: "45 Avenue Hassan II, Rabat (on hold)", qty: 1, rate: 0 },
  ],
  currency: "EUR",
  totals: [{ label: "Total", amount: "€2,052.00", emphasis: true }],
  notes: "This statement combines all monthly-billed units on your account for the period shown.",
  terms: "Payment is collected automatically via your subscription's saved payment method.",
  thanks: "Thank you for choosing Dar Tahara.",
};

/**
 * pdf-lib Flate-compresses content/font streams by default, and writes each
 * `Tj` string operand as a hex literal (`<...>`) rather than `(...)` — both
 * correct, standard PDF, just not directly greppable. Decompress every
 * `stream...endstream` block that inflates cleanly, then hex-decode every
 * `<HEX> Tj` operand, so the test asserts on what the PDF actually renders.
 * The standard fonts use WinAnsiEncoding, which puts the euro sign at byte
 * 0x80 — decoding as latin1 (ISO-8859-1) would otherwise turn that single
 * byte into the unrelated control character U+0080, so it's mapped back.
 */
function extractReadableText(pdf: Buffer): string {
  const text = pdf.toString("latin1");
  let raw = "";
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let streamMatch: RegExpExecArray | null;
  while ((streamMatch = streamRe.exec(text))) {
    const streamBytes = Buffer.from(streamMatch[1], "latin1");
    try {
      raw += inflateSync(streamBytes).toString("latin1");
    } catch {
      raw += streamMatch[1];
    }
  }
  const winAnsiEuroByte = String.fromCharCode(0x80);
  let out = "";
  const tjRe = /<([0-9A-Fa-f]+)>\s*Tj/g;
  let tjMatch: RegExpExecArray | null;
  while ((tjMatch = tjRe.exec(raw))) {
    out += `${Buffer.from(tjMatch[1], "hex").toString("latin1").split(winAnsiEuroByte).join("€")} `;
  }
  return out.replace(/\s+/g, " ").trim();
}

test("produces a well-formed PDF (starts with the PDF header, ends with EOF)", async () => {
  const pdf = await generateInvoicePdf(baseInput);
  assert.ok(pdf.length > 0);
  assert.equal(pdf.subarray(0, 5).toString("latin1"), "%PDF-");
  const tail = pdf.subarray(-16).toString("latin1");
  assert.match(tail, /%%EOF/);
});

test("includes every item's description, computed amount, and the total in the rendered content", async () => {
  const pdf = await generateInvoicePdf(baseInput);
  const text = extractReadableText(pdf);
  assert.match(text, /12 Rue des Oliviers, Tangier/);
  assert.match(text, /45 Avenue Hassan II, Rabat/);
  assert.match(text, /on hold/);
  assert.match(text, /€2,052\.00/);
  assert.match(text, /TOTAL/);
});

test("includes the from/to parties, notes, terms and thanks sections when provided", async () => {
  const pdf = await generateInvoicePdf(baseInput);
  const text = extractReadableText(pdf);
  assert.match(text, /Dar Tahara/);
  assert.match(text, /Test Customer/);
  assert.match(text, /NOTES/);
  assert.match(text, /TERMS/);
  assert.match(text, /Thank you for choosing Dar Tahara/);
});

test("omits the payment section entirely when no payment details are provided", async () => {
  const pdf = await generateInvoicePdf(baseInput);
  const text = extractReadableText(pdf);
  assert.doesNotMatch(text, /PAYMENT DETAILS/);
});

test("renders the payment section when payment details are provided", async () => {
  const pdf = await generateInvoicePdf({
    ...baseInput,
    payment: {
      method: "Charged automatically to the payment method saved on your subscription.",
      descriptor: "DAR TAHARA",
      references: [{ label: "45 Avenue Hassan II, Rabat", value: "in_1AbCdEfGhIjKlMnO" }],
    },
  });
  const text = extractReadableText(pdf);
  assert.match(text, /PAYMENT DETAILS/);
  assert.match(text, /DAR TAHARA/);
  assert.match(text, /in_1AbCdEfGhIjKlMnO/);
});

test("does not throw on names containing PDF-special characters", async () => {
  const pdf = await generateInvoicePdf({ ...baseInput, to: { name: "O'Brien (Villa) \\ Test", lines: [] } });
  assert.equal(pdf.subarray(0, 5).toString("latin1"), "%PDF-");
  const text = extractReadableText(pdf);
  assert.match(text, /O'Brien/);
});

test("renders an unmistakable itemized early-termination settlement invoice", async () => {
  const pdf = await generateInvoicePdf({
    ...baseInput,
    docType: "Early-Termination Settlement Invoice",
    number: "ETS-2026-EXAMPLE",
    items: [{
      description: "45 Avenue Hassan II, Rabat - weekly; original 12-month contract, recalculated to 6-month minimum term",
      qty: 1,
      rate: 1067.28,
    }],
    totals: [
      { label: "Original monthly price (12 months)", amount: "€288.00" },
      { label: "Replacement monthly price (6 months)", amount: "€321.88" },
      { label: "Discount correction", amount: "€101.64" },
      { label: "Remaining minimum term (3 months)", amount: "€965.64" },
      { label: "Final settlement amount", amount: "€1,067.28", emphasis: true },
    ],
    notes: "Contract start: 2026-01-01. Original contract end: 2027-01-01. Early-termination date: 2026-04-01.",
  });
  const text = extractReadableText(pdf);
  assert.match(text, /Early-Termination Settlement Invoice/);
  assert.match(text, /original 12-month contract/);
  assert.match(text, /6-month minimum term/);
  assert.match(text, /Discount correction/);
  assert.match(text, /Remaining minimum term/);
  assert.match(text, /€1,067\.28/);
});
