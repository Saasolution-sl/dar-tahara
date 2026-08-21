import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { secureTokenEqual } from "@/lib/whatsapp/security";
import { createAdminClient } from "@/lib/supabase/admin";
import { runApprovedRetention } from "@/lib/retention-control";
import { serviceInsert, serviceRpc, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Confirmation = { id: string; assessment_id: string; evidence_storage_path: string };

async function run(req: NextRequest) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
  if (!await isAdminAuthorized() && !secureTokenEqual(bearer, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runApprovedRetention({
    categories: ["assessment_confirmation_evidence"],
    execute: async (days) => {
      const scheduled = await serviceRpc<number>("schedule_assessment_confirmation_retention", {
        retention_days: days.assessment_confirmation_evidence,
      });
      const expired = await serviceSelect<Confirmation[]>(
        `assessment_confirmations?retention_delete_after=lte.${encodeURIComponent(new Date().toISOString())}&evidence_deleted_at=is.null&select=id,assessment_id,evidence_storage_path&order=retention_delete_after.asc&limit=500`,
      );
      const bucket = createAdminClient().storage.from("assessment-confirmations");
      let deleted = 0; let failed = 0;
      for (const confirmation of expired) {
        const removal = await bucket.remove([confirmation.evidence_storage_path]);
        if (removal.error) { failed += 1; continue; }
        await serviceUpdate("assessment_confirmations", `id=eq.${confirmation.id}`, {
          evidence_deleted_at: new Date().toISOString(),
        });
        deleted += 1;
      }
      if (deleted || failed) {
        await serviceInsert("audit_logs", { actor_user_id: null, action: "assessment_confirmation_retention_run", resource_type: "assessment_confirmation", resource_id: null, new_value: { examined: expired.length, deleted, failed } });
      }
      return { scheduled, examined: expired.length, deleted, failed };
    },
  });
  const failed = "failed" in result ? result.failed : 0;
  return NextResponse.json({ ok: failed === 0, ...result }, { status: failed ? 207 : 200 });
}

export const GET = run;
export const POST = run;
