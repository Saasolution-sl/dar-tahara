/**
 * Customer-facing table references are intentionally compact. The full
 * document reference (including its prefix and year) remains inside the PDF.
 */
export function compactInvoiceReference(
  reference: string | null | undefined,
  fallbackId: string,
): string {
  const withoutYear = (reference || "").replace(/\b(?:19|20)\d{2}\b/g, "");
  const referenceDigits = withoutYear.replace(/\D/g, "");
  const fallbackDigits = fallbackId.replace(/\D/g, "");
  return (referenceDigits || fallbackDigits).slice(0, 8) || ", ";
}
