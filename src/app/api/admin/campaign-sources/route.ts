import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, adminConfigured } from "@/lib/admin-auth";
import {
  validateCampaignSource,
  toCampaignSourceRow,
  buildTrackedUrl,
} from "@/lib/campaign-sources";
import { serviceInsert, serviceSelect, isServiceRoleConfigured } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

type SourceRow = {
  id: string;
  internal_name: string;
  source_code: string;
  source_channel: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  status: string;
  created_at: string;
};

function withUrl(row: SourceRow) {
  return {
    ...row,
    tracked_url: buildTrackedUrl({
      sourceCode: row.source_code,
      utmSource: row.utm_source ?? undefined,
      utmMedium: row.utm_medium ?? undefined,
      utmCampaign: row.utm_campaign ?? undefined,
      utmContent: row.utm_content ?? undefined,
      utmTerm: row.utm_term ?? undefined,
    }),
  };
}

/** List campaign sources (admin only). */
export async function GET(req: NextRequest) {
  if (!adminConfigured() || !isAdminAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isServiceRoleConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  try {
    const rows = await serviceSelect<SourceRow[]>(
      "campaign_sources?select=*&order=created_at.desc&limit=500",
    );
    return NextResponse.json({ ok: true, sources: rows.map(withUrl) });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

/** Create a campaign source (admin only). Returns the row + its tracked URL. */
export async function POST(req: NextRequest) {
  if (!adminConfigured() || !isAdminAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isServiceRoleConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const validated = validateCampaignSource(body);
  if (!validated.ok) {
    return NextResponse.json({ error: "validation_failed", fields: validated.errors }, { status: 400 });
  }

  try {
    const inserted = await serviceInsert<SourceRow[]>(
      "campaign_sources",
      toCampaignSourceRow(validated.value),
    );
    return NextResponse.json({ ok: true, source: withUrl(inserted[0]) });
  } catch (e) {
    // Duplicate source_code hits the unique constraint.
    if (String(e).includes("23505") || String(e).toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: "duplicate_code", fields: { sourceCode: "duplicate" } }, { status: 409 });
    }
    console.error("[campaign-sources] insert failed");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
