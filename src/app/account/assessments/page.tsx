import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { portalCopy } from "@/i18n/portal-copy";
import { getFeatureFlag, isActive } from "@/lib/feature-flags";
import { PortalCard, StatusBadge } from "@/components/portal/portal-shell";

export default async function AssessmentsPage() {
  const context = await requireAuth(); const locale = await getRequestLocale(); const c = portalCopy[locale]; const db = await createClient();
  const customerId = context.customerId || "00000000-0000-0000-0000-000000000000";
  const [{ data }, portal] = await Promise.all([
    db.from("home_assessments").select("id,reference,status,submitted_at,created_at,requested_frequency,staff_requested_actions,approval_reason,decline_reason,customer_identity_confirmed_at,customer_confirmation_reference,properties(address_line1,city)").eq("customer_id", customerId).order("created_at", { ascending: false }),
    getFeatureFlag("customer_portal_enabled"),
  ]);
  return <div><h1 className="font-serif text-4xl">{c.nav.assessments}</h1>{!isActive(portal) ? <p className="mt-4 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-800">{portal.public_disabled_message}</p> : null}<div className="mt-7 space-y-4">{data?.length ? data.map(row => { const property = Array.isArray(row.properties) ? row.properties[0] : row.properties; return <PortalCard key={row.id} title={row.reference}><div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge value={row.status} /><span className="text-sm text-muted-foreground">{c.dashboard.submitted}: {shortDate(row.submitted_at || row.created_at, locale)}</span></div><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">{c.dashboard.address}</dt><dd>{property ? `${property.address_line1}, ${property.city}` : "Not available"}</dd></div><div><dt className="text-muted-foreground">{c.dashboard.frequency}</dt><dd>{row.requested_frequency}</dd></div>{row.customer_identity_confirmed_at ? <div className="sm:col-span-2 rounded-xl bg-primary/5 p-3"><dt className="font-medium text-primary">Customer confirmation recorded</dt><dd className="mt-1 text-muted-foreground">Confirmed {shortDate(row.customer_identity_confirmed_at, locale)} · reference {shortReference(row.customer_confirmation_reference)}</dd></div> : null}</dl>{row.approval_reason ? <p className="mt-4 rounded-xl bg-primary/5 p-3 text-sm">{row.approval_reason}</p> : null}{row.decline_reason ? <p className="mt-4 rounded-xl bg-red-500/5 p-3 text-sm">{row.decline_reason}</p> : null}</PortalCard>; }) : <PortalCard title={c.nav.assessments}><p className="text-sm text-muted-foreground">{c.dashboard.empty}</p></PortalCard>}</div></div>;
}

function shortDate(value: string, locale: string) { return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value)); }
function shortReference(value: string | null) { return value ? value.split("-")[0].toUpperCase() : "Not available"; }
