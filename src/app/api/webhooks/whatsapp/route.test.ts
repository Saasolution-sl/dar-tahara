import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { NextRequest } from "next/server";
import { GET } from "./route";

const original = process.env.WHATSAPP_VERIFY_TOKEN;
afterEach(() => {
  if (original === undefined) delete process.env.WHATSAPP_VERIFY_TOKEN;
  else process.env.WHATSAPP_VERIFY_TOKEN = original;
});

test("Meta webhook GET returns the challenge only for a valid verification token", async () => {
  process.env.WHATSAPP_VERIFY_TOKEN = "verify-test-token";
  const valid = GET(new NextRequest("https://example.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-test-token&hub.challenge=12345"));
  assert.equal(valid.status, 200);
  assert.equal(await valid.text(), "12345");

  const invalid = GET(new NextRequest("https://example.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345"));
  assert.equal(invalid.status, 403);
});
