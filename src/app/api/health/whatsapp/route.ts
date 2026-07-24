import { NextResponse } from "next/server";
import { assistantProviderConfigured } from "@/lib/assistant/provider";
import { isServiceRoleConfigured, serviceSelect } from "@/lib/supabase-rpc";
import { freeScoutMode } from "@/lib/whatsapp/freescout";
import { isMetaConfigured } from "@/lib/whatsapp/meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = {
    supabase: isServiceRoleConfigured(),
    whatsapp: isMetaConfigured(),
    groq: assistantProviderConfigured(),
    support: freeScoutMode() !== "unconfigured",
    encryption: Boolean(process.env.WHATSAPP_DATA_ENCRYPTION_KEY),
  };
  const supabaseReachable = configured.supabase
    ? await serviceSelect("webhook_events?select=id&limit=1")
        .then(() => true)
        .catch((error: unknown) => {
          console.error(
            "whatsapp_health_supabase_failed",
            error instanceof Error ? error.message : "unknown_error",
          );
          return false;
        })
    : false;
  const ready = configured.whatsapp && configured.encryption && supabaseReachable;
  const complete = ready && configured.groq && configured.support;
  return NextResponse.json({
    status: complete ? "healthy" : ready ? "degraded" : "unhealthy",
    checks: { ...configured, supabaseReachable },
  }, {
    status: ready ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
