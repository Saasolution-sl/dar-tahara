import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { syncWebsiteContent } from "@/lib/assistant/website-indexer";
import { secureTokenEqual } from "@/lib/whatsapp/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
  const authorized = await isAdminAuthorized()
    || secureTokenEqual(bearer, process.env.ASSISTANT_JOB_SECRET)
    || secureTokenEqual(bearer, process.env.CRON_SECRET);
  if (!authorized) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, result: await syncWebsiteContent() });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "content_sync_failed",
    }, { status: 500 });
  }
}
