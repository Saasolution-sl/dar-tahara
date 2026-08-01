import { NextRequest, NextResponse } from "next/server";
import { serviceSelect } from "@/lib/supabase-rpc";
import { constantTimeSecretMatch } from "@/lib/hospitality-support/security";
import { syncConversation } from "@/lib/hospitality-support/sync";
import type { SupportRequestRow } from "@/lib/hospitality-support/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const expected = process.env.HOSPITALITY_SUPPORT_SYNC_SECRET || process.env.CRON_SECRET;
  if (!constantTimeSecretMatch(bearer, expected)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await serviceSelect<SupportRequestRow[]>(
    "support_requests?hospitality_support_conversation_id=not.is.null&status=not.eq.closed&select=*&order=last_message_at.asc.nullsfirst&limit=25",
  );
  let synced = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      await syncConversation(row);
      synced += 1;
    } catch {
      failed += 1;
    }
  }
  return NextResponse.json({ ok: true, synced, failed }, { status: failed ? 207 : 200 });
}
