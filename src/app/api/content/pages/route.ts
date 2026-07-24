import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { loadWebsiteSources } from "@/lib/assistant/website-indexer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    return NextResponse.json({ pages: await loadWebsiteSources() });
  } catch {
    return NextResponse.json({ error: "content_index_not_configured" }, { status: 503 });
  }
}
