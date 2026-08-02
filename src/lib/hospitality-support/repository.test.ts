import assert from "node:assert/strict";
import test from "node:test";
import { findOwnedSupportRequest } from "./repository";

test("ticket lookup always binds both browser ticket id and authenticated customer id", async () => {
  let query = "";
  const result = await findOwnedSupportRequest("customer-1", "request-2", async <T>(value: string) => {
    query = value;
    return [] as T;
  });
  assert.equal(result, null);
  assert.match(query, /id=eq\.request-2/);
  assert.match(query, /customer_id=eq\.customer-1/);
});
