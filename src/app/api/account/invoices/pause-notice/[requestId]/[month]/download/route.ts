import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect } from "@/lib/supabase-rpc";
import { monthsCoveredByPause } from "@/lib/pause-eligibility";
import { generateInvoicePdf, money } from "@/lib/generate-invoice-pdf";
import { getOrArchiveInvoicePdf } from "@/lib/invoice-archive";
import { site } from "@/lib/site";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

type PauseRequestRow = {
  id: string;
  status: string;
  approved_start_date: string | null;
  approved_end_date: string | null;
  subscriptions: {
    id: string;
    frequency: string;
    properties: { address_line1: string; city: string }[] | { address_line1: string; city: string } | null;
  };
};

async function readLogoBytes(): Promise<Uint8Array | undefined> {
  try {
    return await readFile(path.join(process.cwd(), "public", "logo.png"));
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ requestId: string; month: string }> }) {
  const auth = await authorizeApi(["customer"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { requestId, month } = await params;
  const customerId = auth.context.customerId;
  if (!/^[0-9a-f-]{36}$/i.test(requestId) || !/^\d{4}-\d{2}$/.test(month) || !customerId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const rows = await serviceSelect<PauseRequestRow[]>(
    `pause_requests?id=eq.${requestId}&customer_id=eq.${customerId}&status=in.(active,completed)&select=id,status,approved_start_date,approved_end_date,subscriptions(id,frequency,properties(address_line1,city))&limit=1`,
  );
  const pauseRequest = rows[0];
  if (!pauseRequest || !pauseRequest.approved_start_date || !pauseRequest.approved_end_date) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const coveredMonths = monthsCoveredByPause(pauseRequest.approved_start_date, pauseRequest.approved_end_date);
  const monthIndex = coveredMonths.indexOf(month);
  if (monthIndex === -1) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const isFirstMonth = monthIndex === 0;
  const isLastMonth = monthIndex === coveredMonths.length - 1;

  const [customerRows] = await Promise.all([
    serviceSelect<{ full_name: string; email: string; preferred_language: Locale }[]>(
      `customers?id=eq.${customerId}&select=full_name,email,preferred_language&limit=1`,
    ),
  ]);
  const customer = customerRows[0];
  if (!customer) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const property = Array.isArray(pauseRequest.subscriptions.properties) ? pauseRequest.subscriptions.properties[0] : pauseRequest.subscriptions.properties;
  const propertyLabel = property ? `${property.address_line1}, ${property.city}` : pauseRequest.subscriptions.id;

  const monthLabel = new Intl.DateTimeFormat(customer.preferred_language, { month: "long", year: "numeric" }).format(new Date(`${month}-01T00:00:00Z`));
  const issueDate = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
  const resumeDate = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${pauseRequest.approved_end_date}T00:00:00Z`));

  const noteLines = [
    isFirstMonth
      ? `Your pause is now in effect for ${propertyLabel}: no cleaning visits or charges for this period.`
      : `Your subscription remains paused for ${propertyLabel} this month: no charge.`,
    isLastMonth
      ? `This is the final paused month. Your subscription automatically resumes on ${resumeDate}, and regular billing continues from your next scheduled visit.`
      : null,
  ].filter((line): line is string => Boolean(line));

  const pdf = await getOrArchiveInvoicePdf(`pause-notices/${requestId}/${month}.pdf`, async () => generateInvoicePdf({
    docType: "Pause Notice",
    number: `PAUSE-${month}-${requestId.slice(0, 8).toUpperCase()}`,
    date: issueDate,
    reference: monthLabel,
    accent: "#2f4c32",
    logoPngBytes: await readLogoBytes(),
    from: { name: site.name, lines: [`${site.addressLocality}, Morocco`, site.email, site.phoneDisplay] },
    to: { name: customer.full_name, lines: [customer.email] },
    items: [{ description: `${propertyLabel}: subscription paused (${pauseRequest.subscriptions.frequency})`, qty: 1, rate: 0 }],
    currency: "EUR",
    totals: [{ label: "Total", amount: money("EUR", 0), emphasis: true }],
    notes: noteLines.join(" "),
    terms: `This notice is issued subject to Dar Tahara's Terms & Conditions: ${site.url}/${customer.preferred_language}/terms`,
    thanks: "Thank you for your patience: we look forward to caring for your home again soon.",
  }));

  await serviceInsert("customer_activity", {
    customer_id: customerId,
    event_type: "pause_notice_downloaded",
    resource_type: "pause_request",
    resource_id: requestId,
    public_summary: `Pause notice downloaded for ${month}`,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pause-notice-${month}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
