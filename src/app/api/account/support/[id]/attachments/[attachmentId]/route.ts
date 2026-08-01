import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { serviceSelect } from "@/lib/supabase-rpc";
import { downloadSupportAttachment } from "@/lib/hospitality-support/client";
import { requireOwnedSupportRequest } from "@/lib/hospitality-support/repository";

type AttachmentRow = {
  id: string;
  storage_path: string | null;
  external_url: string | null;
  safe_filename: string;
  mime_type: string;
  size_bytes: number;
};

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string; attachmentId: string }> }) {
  const auth = await authorizeApi(["applicant", "customer", "customer_company"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  const { id, attachmentId } = await context.params;
  try {
    await requireOwnedSupportRequest(auth.context.customerId, id);
  } catch {
    return NextResponse.json({ error: "attachment_not_found" }, { status: 404 });
  }
  const rows = await serviceSelect<AttachmentRow[]>(
    `support_attachments?id=eq.${encodeURIComponent(attachmentId)}&support_request_id=eq.${encodeURIComponent(id)}&customer_id=eq.${encodeURIComponent(auth.context.customerId)}&visibility=eq.customer&select=id,storage_path,external_url,safe_filename,mime_type,size_bytes&limit=1`,
  );
  const attachment = rows[0];
  if (!attachment) return NextResponse.json({ error: "attachment_not_found" }, { status: 404 });
  if (attachment.storage_path) {
    const admin = createAdminClient();
    const signed = await admin.storage.from("support-attachments").createSignedUrl(attachment.storage_path, 60, { download: attachment.safe_filename });
    if (signed.error || !signed.data.signedUrl) return NextResponse.json({ error: "attachment_unavailable" }, { status: 502 });
    return NextResponse.redirect(signed.data.signedUrl);
  }
  if (!attachment.external_url) return NextResponse.json({ error: "attachment_unavailable" }, { status: 404 });
  try {
    const upstream = await downloadSupportAttachment(attachment.external_url);
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": attachment.mime_type,
        "Content-Length": String(attachment.size_bytes),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.safe_filename)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "attachment_unavailable" }, { status: 502 });
  }
}
