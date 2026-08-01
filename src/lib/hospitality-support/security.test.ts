import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import { constantTimeSecretMatch, safeAttachmentFilename, supportWebhookAuthorized, validateAttachment, verifyFreeScoutWebhookSignature } from "./security";

test("webhooks require the configured shared secret", () => {
  process.env.HOSPITALITY_SUPPORT_WEBHOOK_SECRET = "correct-secret";
  assert.equal(supportWebhookAuthorized(new Headers({ "x-hospitality-support-secret":"correct-secret" }), "body"), true);
  assert.equal(supportWebhookAuthorized(new Headers({ authorization:"Bearer wrong" }), "body"), false);
  assert.equal(constantTimeSecretMatch(undefined, "correct-secret"), false);
  delete process.env.HOSPITALITY_SUPPORT_WEBHOOK_SECRET;
});

test("FreeScout signatures are verified over the unmodified raw body", () => {
  const rawBody = '{"id":42,"status":"pending"}';
  const signature = createHmac("sha1", "webhook-secret").update(rawBody).digest("base64");
  assert.equal(verifyFreeScoutWebhookSignature(rawBody, signature, "webhook-secret"), true);
  assert.equal(verifyFreeScoutWebhookSignature(`${rawBody} `, signature, "webhook-secret"), false);
  process.env.HOSPITALITY_SUPPORT_WEBHOOK_SECRET = "webhook-secret";
  assert.equal(supportWebhookAuthorized(new Headers({ "x-freescout-signature":signature }), rawBody), true);
  delete process.env.HOSPITALITY_SUPPORT_WEBHOOK_SECRET;
});

test("attachment validation rejects executables, spoofed types and oversized files", () => {
  assert.equal(safeAttachmentFilename("../../invoice (1).pdf"), "invoice _1_.pdf");
  assert.equal(validateAttachment({ name:"photo.jpg", type:"image/jpeg", size:1024 } as File), null);
  assert.equal(validateAttachment({ name:"installer.exe", type:"image/jpeg", size:1024 } as File), "attachment_type");
  assert.equal(validateAttachment({ name:"photo.jpg", type:"application/x-msdownload", size:1024 } as File), "attachment_type");
  assert.equal(validateAttachment({ name:"video.mp4", type:"video/mp4", size:11 * 1024 * 1024 } as File), "attachment_size");
});
