import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { serviceSelect, isServiceRoleConfigured } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

type Row = {
  email: string;
  first_name: string | null;
  preferred_language: string | null;
  country_code: string | null;
  city: string | null;
  signup_source: string | null;
  consent_given: boolean;
  confirmed_at: string | null;
  created_at: string;
};

function authorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return false;
  const header = req.headers.get("authorization") || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function csvEscape(v: string | boolean | null): string {
  const s = v === null ? "" : String(v);
  // Prevent spreadsheet formula execution when an exported user-controlled
  // field begins with a formula sigil (CSV injection).
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * Admin-only subscriber view / CSV export.
 * Requires ADMIN_API_TOKEN (bearer) and the service-role key. Excludes
 * unsubscribed users. Query: ?format=csv|json&language=&country=&status=confirmed|unconfirmed
 */
export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_API_TOKEN || !isServiceRoleConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const p = req.nextUrl.searchParams;
  const filters: string[] = ["unsubscribed_at=is.null"]; // always exclude unsubscribed
  const language = p.get("language");
  const country = p.get("country");
  const status = p.get("status");
  if (language) filters.push(`preferred_language=eq.${encodeURIComponent(language)}`);
  if (country) filters.push(`country_code=eq.${encodeURIComponent(country.toUpperCase())}`);
  if (status === "confirmed") filters.push("confirmed_at=not.is.null");
  if (status === "unconfirmed") filters.push("confirmed_at=is.null");

  const select =
    "select=email,first_name,preferred_language,country_code,city,signup_source,consent_given,confirmed_at,created_at";
  const query = `mailing_list?${filters.join("&")}&${select}&order=created_at.desc&limit=10000`;

  let rows: Row[];
  try {
    rows = await serviceSelect<Row[]>(query);
  } catch {
    console.error("[admin] query failed");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (p.get("format") === "csv") {
    const header = [
      "email", "first_name", "preferred_language", "country_code", "city",
      "signup_source", "consent_given", "confirmed_at", "created_at",
    ];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.email, r.first_name, r.preferred_language, r.country_code, r.city,
          r.signup_source, r.consent_given, r.confirmed_at, r.created_at,
        ].map(csvEscape).join(","),
      );
    }
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="dar-tahara-subscribers.csv"`,
      },
    });
  }

  const confirmed = rows.filter((r) => r.confirmed_at).length;
  const byLanguage: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  for (const r of rows) {
    if (r.preferred_language) byLanguage[r.preferred_language] = (byLanguage[r.preferred_language] || 0) + 1;
    if (r.country_code) byCountry[r.country_code] = (byCountry[r.country_code] || 0) + 1;
  }

  return NextResponse.json({
    total: rows.length,
    confirmed,
    unconfirmed: rows.length - confirmed,
    byLanguage,
    byCountry,
  });
}
