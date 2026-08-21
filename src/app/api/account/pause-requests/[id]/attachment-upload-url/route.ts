import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect } from "@/lib/supabase-rpc";
import { deleteObject, putObject } from "@/lib/cubbit/client";
import { inspectAttachmentBytes } from "@/lib/file-security";
import { safeAttachmentFilename } from "@/lib/hospitality-support/security";
import { rateLimitShared } from "@/lib/rate-limit";
import { emitSecurityEvent } from "@/lib/security-events";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Receives and scans the attachment server-side before storing it. Direct
 * browser-to-object-store uploads cannot be inspected before becoming
 * accessible, so production deliberately fails closed when the scanner is
 * unavailable.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeApi(["customer"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const customerId = auth.context.customerId;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !customerId) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const limit = await rateLimitShared(`pause-attachment:${auth.context.user.id}`, { windowMs: 60_000, max: 10 });
  if (!limit.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_SIZE_BYTES + 1024 * 1024) return NextResponse.json({ error: "attachment_size" }, { status: 413 });

  const owned = await serviceSelect<Array<{ id: string }>>(
    `pause_requests?id=eq.${id}&customer_id=eq.${customerId}&select=id&limit=1`,
  );
  if (!owned[0]) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("attachment");
  if (!(file instanceof File)) return NextResponse.json({ error: "attachment_required" }, { status: 400 });
  const fileName = file.name;
  const mimeType = file.type;
  const sizeBytes = file.size;
  if (!fileName || !ALLOWED_MIME_TYPES.has(mimeType)) return NextResponse.json({ error: "attachment_type" }, { status: 400 });
  if (!sizeBytes || sizeBytes > MAX_SIZE_BYTES) return NextResponse.json({ error: "attachment_size" }, { status: 400 });

  const safeName = safeAttachmentFilename(fileName);
  const storagePath = `pause-request-attachments/${auth.context.user.id}/${id}/${randomUUID()}-${safeName}`;
  let objectStored = false;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const inspection = await inspectAttachmentBytes(bytes, mimeType);
    await putObject(storagePath, bytes, mimeType);
    objectStored = true;
    await serviceInsert("pause_request_attachments", {
      pause_request_id: id,
      customer_id: customerId,
      uploaded_by: auth.context.user.id,
      storage_path: storagePath,
      storage_provider: "cubbit",
      original_filename: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      scan_status: inspection.status,
      scan_engine: inspection.engine,
      scan_signature: inspection.signature,
      content_sha256: inspection.sha256,
      scanned_at: inspection.scannedAt,
    });
    return NextResponse.json({ ok: true, safeFilename: safeName });
  } catch (error) {
    if (objectStored) await deleteObject(storagePath).catch(() => undefined);
    const code = error instanceof Error ? error.message : "attachment_unavailable";
    const rejected = ["attachment_content_type_mismatch", "malware_detected"].includes(code);
    await emitSecurityEvent({
      type: "file_upload_rejected",
      severity: rejected ? "high" : "medium",
      actorId: auth.context.user.id,
      metadata: { route_class: "pause_request_attachment", reason_code: code, claimed_mime: mimeType, size_bytes: sizeBytes },
    });
    return NextResponse.json({ error: rejected ? code : "attachment_unavailable" }, { status: rejected ? 400 : 503 });
  }
}
