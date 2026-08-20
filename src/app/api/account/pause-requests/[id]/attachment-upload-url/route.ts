import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceSelect } from "@/lib/supabase-rpc";
import { presignPutUrl } from "@/lib/cubbit/client";
import { safeAttachmentFilename } from "@/lib/hospitality-support/security";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Mints a short-lived presigned Cubbit PUT URL so the browser can upload a
 * pause-request attachment directly, without the Cubbit secret key ever
 * reaching the client. The DB row is still inserted client-side afterwards,
 * same as before, since that only needs the customer's own Supabase session.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeApi(["customer"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const customerId = auth.context.customerId;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !customerId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const owned = await serviceSelect<Array<{ id: string }>>(
    `pause_requests?id=eq.${id}&customer_id=eq.${customerId}&select=id&limit=1`,
  );
  if (!owned[0]) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const fileName = typeof body.fileName === "string" ? body.fileName : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
  const sizeBytes = typeof body.sizeBytes === "number" ? body.sizeBytes : 0;
  if (!fileName || !ALLOWED_MIME_TYPES.has(mimeType)) return NextResponse.json({ error: "attachment_type" }, { status: 400 });
  if (!sizeBytes || sizeBytes > MAX_SIZE_BYTES) return NextResponse.json({ error: "attachment_size" }, { status: 400 });

  const safeName = safeAttachmentFilename(fileName);
  const storagePath = `pause-request-attachments/${auth.context.user.id}/${id}/${randomUUID()}-${safeName}`;
  try {
    const uploadUrl = await presignPutUrl(storagePath, mimeType, 300);
    return NextResponse.json({ uploadUrl, storagePath, safeFilename: safeName });
  } catch {
    return NextResponse.json({ error: "attachment_unavailable" }, { status: 502 });
  }
}
