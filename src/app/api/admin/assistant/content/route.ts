import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { loadWebsiteSources, syncWebsiteContent } from "@/lib/assistant/website-indexer";
import {
  loadKnowledgeEngineAnalytics,
  loadWebsiteKnowledgeSuggestions,
  reviewWebsiteKnowledgeSuggestion,
} from "@/lib/assistant/website-suggestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const [suggestions, sources, analytics] = await Promise.all([
      loadWebsiteKnowledgeSuggestions("all"),
      loadWebsiteSources(),
      loadKnowledgeEngineAnalytics(),
    ]);
    return NextResponse.json({ suggestions, sources, analytics });
  } catch {
    return NextResponse.json({ error: "knowledge_engine_not_configured" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => null) as {
    action?: unknown;
    id?: unknown;
    notes?: unknown;
  } | null;
  const action = typeof body?.action === "string" ? body.action : "";
  try {
    if (action === "sync") return NextResponse.json({ ok: true, result: await syncWebsiteContent() });
    if ((action === "approve" || action === "reject") && typeof body?.id === "string") {
      await reviewWebsiteKnowledgeSuggestion({
        id: body.id,
        action,
        reviewerId: auth.context.user.id,
        notes: typeof body.notes === "string" ? body.notes : undefined,
      });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "knowledge_engine_action_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
