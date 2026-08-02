import { SupportOverview } from "@/components/portal/support-portal";
import { supportCopy } from "@/i18n/support-copy";
import { requireCustomerPortal } from "@/lib/feature-flags";
import type { SupportRequestRow } from "@/lib/hospitality-support/types";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { createClient } from "@/lib/supabase/server";

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  await requireCustomerPortal();
  const context = await requireAuth("/account/support");
  const locale = await getRequestLocale();
  const copy = supportCopy[locale];
  const db = await createClient();
  const customerId = context.customerId || "00000000-0000-0000-0000-000000000000";
  const [requestsResult, propertiesResult, subscriptionsResult, invoicesResult, appointmentsResult, paymentsResult] = await Promise.all([
    db.from("support_requests").select("*").eq("customer_id", customerId).order("last_message_at", { ascending:false, nullsFirst:false }).order("created_at", { ascending:false }),
    db.from("properties").select("id,address_line1,address_line2,city").eq("customer_id", customerId).order("created_at", { ascending:false }),
    db.from("subscriptions").select("id,frequency,status,property_id").eq("customer_id", customerId).order("created_at", { ascending:false }),
    db.from("invoices").select("id,invoice_number,status,created_at").eq("customer_id", customerId).order("created_at", { ascending:false }).limit(100),
    db.from("service_bookings").select("id,service_window_start,service_window_end,status").eq("customer_id", customerId).order("service_window_start", { ascending:false }).limit(100),
    db.from("payments").select("id,provider_payment_id,status,created_at").eq("customer_id", customerId).order("created_at", { ascending:false }).limit(100),
  ]);
  if (requestsResult.error) return <div><h1 className="font-serif text-4xl">{copy.title}</h1><p className="mt-5 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{copy.unavailable}</p></div>;
  const properties = propertiesResult.data || [];
  const propertyLabels = new Map(properties.map((row) => [row.id, [row.address_line1,row.address_line2,row.city].filter(Boolean).join(", ")]));
  const requests = (requestsResult.data || []).map((row) => ({
    ...(row as SupportRequestRow),
    relatedLabel: row.related_property_id ? propertyLabels.get(row.related_property_id) || null : null,
  }));
  const params = await searchParams;
  return <SupportOverview
    initialRequests={requests}
    related={{
      properties: properties.map((row) => ({ id:row.id, label:propertyLabels.get(row.id) || row.id })),
      subscriptions: (subscriptionsResult.data || []).map((row) => ({ id:row.id, label:`${copy.subscription} ${row.id.slice(0,8)}${propertyLabels.get(row.property_id) ? ` · ${propertyLabels.get(row.property_id)}` : ""}` })),
      invoices: (invoicesResult.data || []).map((row) => ({ id:row.id, label:row.invoice_number || `${copy.invoice} ${row.id.slice(0,8)}` })),
      appointments: (appointmentsResult.data || []).map((row) => ({ id:row.id, label:`${row.service_window_start} – ${row.service_window_end}` })),
      payments: (paymentsResult.data || []).map((row) => ({ id:row.id, label:row.provider_payment_id || `${copy.payment} ${row.id.slice(0,8)}` })),
    }}
    copy={copy}
    locale={locale}
    openNew={params.new === "1"}
  />;
}
