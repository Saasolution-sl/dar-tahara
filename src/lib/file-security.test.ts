import assert from "node:assert/strict";
import { test } from "node:test";
import { detectAttachmentMime, inspectAttachmentBytes } from "./file-security";

test("detects supported content from bytes rather than the claimed MIME", () => {
  assert.equal(detectAttachmentMime(Uint8Array.from([0xff, 0xd8, 0xff, 0x01])), "image/jpeg");
  assert.equal(detectAttachmentMime(Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])), "application/pdf");
  assert.equal(detectAttachmentMime(new TextEncoder().encode("ordinary support note\n")), "text/plain");
  assert.equal(detectAttachmentMime(Uint8Array.from([0x4d, 0x5a, 0x90, 0x00])), null);
});

test("rejects a MIME claim that does not match the file signature", async () => {
  await assert.rejects(
    inspectAttachmentBytes(Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d]), "image/jpeg", { production: false }),
    /attachment_content_type_mismatch/,
  );
});

test("production fails closed when no malware scanner is configured", async () => {
  const prior = process.env.MALWARE_SCANNER_URL;
  delete process.env.MALWARE_SCANNER_URL;
  try {
    await assert.rejects(
      inspectAttachmentBytes(Uint8Array.from([0xff, 0xd8, 0xff, 0x01]), "image/jpeg", { production: true }),
      /malware_scanner_not_configured/,
    );
  } finally {
    if (prior) process.env.MALWARE_SCANNER_URL = prior;
  }
});

test("accepts only an explicit clean response from the external scanner", async () => {
  const prior = process.env.MALWARE_SCANNER_URL;
  process.env.MALWARE_SCANNER_URL = "https://scanner.example.test/scan";
  try {
    const result = await inspectAttachmentBytes(
      Uint8Array.from([0xff, 0xd8, 0xff, 0x01]),
      "image/jpeg",
      {
        production: true,
        now: new Date("2026-08-21T12:00:00Z"),
        fetchImpl: async () => new Response(JSON.stringify({ clean: true, engine: "clamav", signature: "ok" }), { status: 200 }) as never,
      },
    );
    assert.equal(result.status, "clean");
    assert.equal(result.engine, "clamav");
    assert.match(result.sha256, /^[0-9a-f]{64}$/);
  } finally {
    if (prior) process.env.MALWARE_SCANNER_URL = prior;
    else delete process.env.MALWARE_SCANNER_URL;
  }
});
