import { permanentRedirect } from "next/navigation";
import { isLocale, defaultLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

/**
 * The former lightweight invite page has been superseded by the full early-access
 * flow. Permanently redirect any circulating /invite links to /early-access so
 * attribution and referrals flow through the one canonical funnel, and search
 * engines consolidate onto it (brief §37). The campaign query string (src / utm
 * / ref) is forwarded explicitly so tagged links keep their attribution.
 */
export default async function InviteRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const target = isLocale(locale) ? locale : defaultLocale;

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") qs.set(k, v);
    else if (Array.isArray(v) && v[0]) qs.set(k, v[0]);
  }
  const query = qs.toString();
  permanentRedirect(`/${target}/early-access${query ? `?${query}` : ""}`);
}
