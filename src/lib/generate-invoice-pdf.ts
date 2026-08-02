/**
 * Branded PDF generator for the combined monthly statement (and reusable for
 * any future generated invoice-like document). Built on `pdf-lib` — pure JS,
 * no native dependencies, safe to run inside a Next.js API route.
 *
 * Layout matches the owner-supplied invoice template: a thin accent bar top
 * and bottom, a logo (or wordmark fallback while no logo file exists yet) +
 * big "Invoice"/"Statement" heading, a 3-column meta row (No./Date/Ref),
 * side-by-side From/Billed-to blocks, a plain-text item table header
 * underlined in accent, a Subtotal/Discount/Tax/Total breakdown, then
 * optional Payment/Terms sections and a centered thank-you line.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage, type RGB } from "pdf-lib";

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  return rgb(
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  );
}

const INK = rgb(0x1f / 255, 0x1f / 255, 0x1c / 255);
const MUTED = rgb(0x8a / 255, 0x86 / 255, 0x80 / 255);
const BORDER = rgb(0xe1 / 255, 0xe0 / 255, 0xdc / 255);

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 50;
const BAR_HEIGHT = 10;
const LOGO_HEIGHT = 28;
const BODY_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

export type InvoiceParty = { name: string; lines: string[] };
export type InvoiceItem = { description: string; qty: number; rate: number };
export type InvoiceTotal = { label: string; amount: string; emphasis?: boolean };
export type InvoicePaymentReference = { label: string; value: string };
export type InvoicePayment = {
  method?: string;
  descriptor?: string;
  references?: InvoicePaymentReference[];
};

export type InvoicePdfInput = {
  docType: string;
  number: string;
  date: string;
  reference?: string;
  accent: string;
  /** Raw PNG bytes for the company logo; falls back to a text wordmark when omitted. */
  logoPngBytes?: Uint8Array;
  from: InvoiceParty;
  to: InvoiceParty;
  items: InvoiceItem[];
  currency: string;
  totals: InvoiceTotal[];
  notes?: string;
  payment?: InvoicePayment;
  terms?: string;
  thanks?: string;
};

export function money(currency: string, value: number): string {
  const formatted = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = value < 0 ? "-" : "";
  if (currency === "EUR") return `${sign}€${formatted}`;
  return `${sign}${currency} ${formatted}`;
}

export async function generateInvoicePdf(input: InvoicePdfInput): Promise<Buffer> {
  const accent = hexToRgb(input.accent);
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = input.logoPngBytes ? await doc.embedPng(input.logoPngBytes) : null;

  const tableWidth = PAGE_WIDTH - MARGIN_X * 2;
  const rightX = PAGE_WIDTH - MARGIN_X;

  // Top and bottom accent bars
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - BAR_HEIGHT, width: PAGE_WIDTH, height: BAR_HEIGHT, color: accent });
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: BAR_HEIGHT, color: accent });

  let y = PAGE_HEIGHT - BAR_HEIGHT - 42;

  // Keep the brand and document title on separate rows. Settlement titles are
  // deliberately long and must never compete with the wordmark for space.
  if (logo) {
    drawLogo(page, logo, MARGIN_X, y);
  } else {
    page.drawText(input.from.name, { x: MARGIN_X, y, size: 15, font: sansBold, color: accent });
  }
  y -= 42;
  const title = fitWrappedText(input.docType, sansBold, 22, BODY_WIDTH, 2, 18);
  y = drawTextLines(page, title.lines, MARGIN_X, y, title.size, title.size + 5, sansBold, INK) - 24;

  // Meta row: Invoice No. / Issue Date / Reference
  const metaCols: [string, string | undefined][] = [
    ["INVOICE NO.", input.number],
    ["ISSUE DATE", input.date],
    ["REFERENCE", input.reference],
  ];
  const colWidth = tableWidth / metaCols.length;
  for (const [i, [label, value]] of metaCols.entries()) {
    const x = MARGIN_X + colWidth * i;
    page.drawText(label, { x, y, size: 8, font: sansBold, color: MUTED });
    page.drawText(value || "-", { x, y: y - 15, size: 9.5, font: sans, color: INK });
  }
  y -= 34;
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: rightX, y }, thickness: 1, color: accent });
  y -= 28;

  // From / Billed To, side by side
  const billToX = MARGIN_X + tableWidth / 2 + 10;
  const fromBottom = drawParty(page, "FROM", input.from, MARGIN_X, y, sans, sansBold);
  const toBottom = drawParty(page, "BILLED TO", input.to, billToX, y, sans, sansBold);
  y = Math.min(fromBottom, toBottom) - 24;

  // Item table header (plain text + accent underline, no fill)
  const qtyRightX = MARGIN_X + tableWidth * 0.64;
  const rateRightX = MARGIN_X + tableWidth * 0.82;
  const descriptionWidth = qtyRightX - MARGIN_X - 46;
  page.drawText("DESCRIPTION", { x: MARGIN_X, y, size: 8, font: sansBold, color: MUTED });
  drawTextRight(page, "QTY", qtyRightX, y, 8, sansBold, MUTED);
  drawTextRight(page, "RATE", rateRightX, y, 8, sansBold, MUTED);
  drawTextRight(page, "AMOUNT", rightX, y, 8, sansBold, MUTED);
  y -= 8;
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: rightX, y }, thickness: 1, color: accent });
  y -= 22;

  for (const item of input.items) {
    if (y < 240) break;
    const amount = item.qty * item.rate;
    const description = fitWrappedText(item.description, sans, 9.5, descriptionWidth, 3, 8);
    const lineHeight = description.size + 3;
    drawTextLines(page, description.lines, MARGIN_X, y, description.size, lineHeight, sans, INK);
    drawTextRight(page, String(item.qty), qtyRightX, y, 9.5, sans, INK);
    drawTextRight(page, money(input.currency, item.rate), rateRightX, y, 9.5, sans, MUTED);
    drawTextRight(page, money(input.currency, amount), rightX, y, 9.5, sansBold, INK);
    y -= Math.max(22, description.lines.length * lineHeight + 8);
  }
  y -= 8;

  // Reserve a real amount column. Labels wrap inside their own measured area,
  // so even the longest settlement explanation keeps clear of its price.
  const totalsLabelX = MARGIN_X + tableWidth * 0.36;
  const totalsAmountLeftX = rightX - 82;
  const totalsLabelWidth = totalsAmountLeftX - totalsLabelX - 14;
  for (const [i, total] of input.totals.entries()) {
    const isEmphasis = total.emphasis || i === input.totals.length - 1;
    if (isEmphasis) {
      page.drawLine({ start: { x: totalsLabelX, y: y + 8 }, end: { x: rightX, y: y + 8 }, thickness: 1, color: BORDER });
      y -= 14;
      const labelLines = wrapText(total.label.toUpperCase(), sansBold, 9.25, totalsLabelWidth);
      drawTextLines(page, labelLines, totalsLabelX, y, 9.25, 12, sansBold, INK);
      drawTextRight(page, total.amount, rightX, y - 2, 18, sansBold, INK);
      y -= Math.max(28, labelLines.length * 12 + 8);
    } else {
      const labelLines = wrapText(total.label, sans, 8.5, totalsLabelWidth);
      drawTextLines(page, labelLines, totalsLabelX, y, 8.5, 11, sans, MUTED);
      drawTextRight(page, total.amount, rightX, y, 9.5, sans, INK);
      y -= Math.max(15, labelLines.length * 11 + 4);
    }
  }
  y -= 18;

  // Payment details — enough for a bookkeeper to match this statement to a real bank/card transaction
  if (input.payment && (input.payment.method || input.payment.descriptor || input.payment.references?.length)) {
    page.drawText("PAYMENT DETAILS", { x: MARGIN_X, y, size: 9, font: sansBold, color: MUTED });
    y -= 16;
    if (input.payment.method) y = drawKeyValue(page, "PAYMENT METHOD", [input.payment.method], y, sans, sansBold);
    if (input.payment.descriptor) y = drawKeyValue(page, "APPEARS ON YOUR BANK/CARD STATEMENT AS", [input.payment.descriptor], y, sans, sansBold);
    if (input.payment.references?.length) {
      y = drawKeyValue(
        page,
        "INVOICE REFERENCES",
        input.payment.references.map((r) => `${r.label}: ${r.value}`),
        y,
        sans,
        sansBold,
      );
    }
    y -= 6;
  }

  // Notes / terms
  if (input.notes) y = drawSection(page, "NOTES", input.notes, y, sans, sansBold);
  if (input.terms) y = drawSection(page, "TERMS", input.terms, y, sans, sansBold);

  if (input.thanks) {
    const thanksY = Math.max(y - 10, BAR_HEIGHT + 30);
    page.drawLine({ start: { x: MARGIN_X, y: thanksY + 20 }, end: { x: rightX, y: thanksY + 20 }, thickness: 1, color: accent });
    const width = sans.widthOfTextAtSize(input.thanks, 10);
    page.drawText(input.thanks, { x: (PAGE_WIDTH - width) / 2, y: thanksY, size: 10, font: sans, color: INK });
  }

  const bytes = await doc.save({ useObjectStreams: false });
  return Buffer.from(bytes);
}

function drawLogo(page: PDFPage, logo: PDFImage, x: number, topY: number) {
  const scale = LOGO_HEIGHT / logo.height;
  const width = logo.width * scale;
  page.drawImage(logo, { x, y: topY - LOGO_HEIGHT + 6, width, height: LOGO_HEIGHT });
}

function drawParty(page: PDFPage, label: string, party: InvoiceParty, x: number, y: number, sans: PDFFont, sansBold: PDFFont): number {
  page.drawText(label, { x, y, size: 8, font: sansBold, color: MUTED });
  let cursor = y - 16;
  page.drawText(party.name, { x, y: cursor, size: 11, font: sansBold, color: INK });
  for (const line of party.lines) {
    cursor -= 14;
    page.drawText(line, { x, y: cursor, size: 9, font: sans, color: MUTED });
  }
  return cursor;
}

function drawKeyValue(page: PDFPage, label: string, valueLines: string[], y: number, sans: PDFFont, sansBold: PDFFont): number {
  page.drawText(label, { x: MARGIN_X, y, size: 7, font: sansBold, color: MUTED });
  let cursor = y - 12;
  for (const value of valueLines) {
    const lines = wrapText(value, sans, 9, BODY_WIDTH);
    cursor = drawTextLines(page, lines, MARGIN_X, cursor, 9, 12, sans, INK);
  }
  return cursor - 6;
}

function drawSection(page: PDFPage, heading: string, body: string, y: number, sans: PDFFont, sansBold: PDFFont): number {
  page.drawText(heading, { x: MARGIN_X, y, size: 9, font: sansBold, color: MUTED });
  let cursor = y - 14;
  for (const paragraph of body.split("\n")) {
    const lines = wrapText(paragraph, sans, 8.5, BODY_WIDTH);
    cursor = drawTextLines(page, lines, MARGIN_X, cursor, 8.5, 12, sans, MUTED);
  }
  return cursor - 12;
}

function fitWrappedText(
  text: string,
  font: PDFFont,
  preferredSize: number,
  maxWidth: number,
  preferredMaxLines: number,
  minimumSize: number,
): { lines: string[]; size: number } {
  for (let size = preferredSize; size >= minimumSize; size -= 0.5) {
    const lines = wrapText(text, font, size, maxWidth);
    if (lines.length <= preferredMaxLines) return { lines, size };
  }
  return { lines: wrapText(text, font, minimumSize, maxWidth), size: minimumSize };
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const paragraphs = text.replace(/\s+/g, " ").trim().split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push("");
      continue;
    }

    let current = "";
    for (const word of paragraph.split(" ")) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        lines.push(current);
        current = "";
      }

      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        current = word;
        continue;
      }

      let fragment = "";
      for (const character of word) {
        const candidateFragment = fragment + character;
        if (fragment && font.widthOfTextAtSize(candidateFragment, size) > maxWidth) {
          lines.push(fragment);
          fragment = character;
        } else {
          fragment = candidateFragment;
        }
      }
      current = fragment;
    }

    if (current) lines.push(current);
  }

  return lines.length ? lines : [""];
}

function drawTextLines(
  page: PDFPage,
  lines: string[],
  x: number,
  y: number,
  size: number,
  lineHeight: number,
  font: PDFFont,
  color: RGB,
): number {
  let cursor = y;
  for (const line of lines) {
    if (line) page.drawText(line, { x, y: cursor, size, font, color });
    cursor -= lineHeight;
  }
  return cursor;
}

function drawTextRight(page: PDFPage, text: string, rightX: number, y: number, size: number, font: PDFFont, color: RGB) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: rightX - width, y, size, font, color });
}
