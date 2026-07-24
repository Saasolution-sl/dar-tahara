import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { runAssistantKnowledgeRetention } from "@/lib/assistant/knowledge-builder";
import { syncWebsiteContent } from "@/lib/assistant/website-indexer";
import { secureTokenEqual } from "@/lib/whatsapp/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function runRetention(req: NextRequest) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
  const hasJobToken = secureTokenEqual(bearer, process.env.ASSISTANT_JOB_SECRET)
    || secureTokenEqual(bearer, process.env.CRON_SECRET);
  if (!await isAdminAuthorized() && !hasJobToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [retention, websiteSync] = await Promise.allSettled([
    runAssistantKnowledgeRetention(),
    syncWebsiteContent(),
  ]);
  return NextResponse.json({
    ok: retention.status === "fulfilled" || websiteSync.status === "fulfilled",
    retention: retention.status === "fulfilled"
      ? { ok: true, deleted: retention.value }
      : { ok: false, error: "retention_failed" },
    websiteSync: websiteSync.status === "fulfilled"
      ? { ok: true, result: websiteSync.value }
      : { ok: false, error: "website_sync_failed" },
  }, {
    status: retention.status === "rejected" && websiteSync.status === "rejected" ? 500 : 200,
  });
}

// Vercel Cron invokes routes with GET and sends CRON_SECRET as a bearer token.
export const GET = runRetention;
export const POST = runRetention;
