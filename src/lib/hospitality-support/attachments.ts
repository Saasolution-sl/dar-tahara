import "server-only";

import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { serviceInsert } from "@/lib/supabase-rpc";
import {
  MAX_SUPPORT_ATTACHMENTS,
  safeAttachmentFilename,
  validateAttachment,
} from "./security";
import type { SupportAttachmentInput } from "./types";

export type ParsedSupportAttachment = {
  file: File;
  input: SupportAttachmentInput;
  safeName: string;
};

export async function parseSupportAttachments(formData: FormData): Promise<ParsedSupportAttachment[]> {
  const files = formData.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > MAX_SUPPORT_ATTACHMENTS) throw new Error("too_many_attachments");
  return await Promise.all(files.map(async (file) => {
    const error = validateAttachment(file);
    if (error) throw new Error(error);
    const bytes = new Uint8Array(await file.arrayBuffer());
    return {
      file,
      safeName: safeAttachmentFilename(file.name),
      input: {
        fileName: safeAttachmentFilename(file.name),
        mimeType: file.type,
        size: file.size,
        data: Buffer.from(bytes).toString("base64"),
      },
    };
  }));
}

export async function storeCustomerAttachments(input: {
  authUserId: string;
  customerId: string;
  supportRequestId: string;
  supportMessageId?: string | null;
  attachments: ParsedSupportAttachment[];
}): Promise<void> {
  if (!input.attachments.length) return;
  const admin = createAdminClient();
  for (const attachment of input.attachments) {
    const storagePath = `${input.authUserId}/${input.supportRequestId}/${randomUUID()}-${attachment.safeName}`;
    const upload = await admin.storage.from("support-attachments").upload(storagePath, await attachment.file.arrayBuffer(), {
      contentType: attachment.file.type,
      cacheControl: "private, max-age=0, no-store",
      upsert: false,
    });
    if (upload.error) throw new Error("support_attachment_upload_failed");
    await serviceInsert("support_attachments", {
      support_request_id: input.supportRequestId,
      support_message_id: input.supportMessageId || null,
      customer_id: input.customerId,
      storage_path: storagePath,
      original_filename: attachment.file.name,
      safe_filename: attachment.safeName,
      mime_type: attachment.file.type,
      size_bytes: attachment.file.size,
      visibility: "customer",
    });
  }
}
