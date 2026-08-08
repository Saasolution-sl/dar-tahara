import { NextResponse } from "next/server";
import { featureEnabled } from "@/lib/feature-flags";
import { AI_ASSISTANT_DISABLED_CODE } from "@/lib/assistant/availability-state";

export const dynamic = "force-dynamic";

export async function GET() {
  const enabled = await featureEnabled("ai_assistant_enabled");
  return NextResponse.json({
    enabled,
    ...(enabled ? {} : { code: AI_ASSISTANT_DISABLED_CODE }),
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
