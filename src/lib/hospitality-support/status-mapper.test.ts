import assert from "node:assert/strict";
import test from "node:test";
import { isPermanentlyClosed, mapHospitalitySupportStatus, statusAfterCustomerReply } from "./status-mapper";

test("maps provider statuses through one customer-facing status mapper", () => {
  assert.equal(mapHospitalitySupportStatus("active"), "open");
  assert.equal(mapHospitalitySupportStatus("active", { latestSender:"customer" }), "waiting_support");
  assert.equal(mapHospitalitySupportStatus("pending", { latestSender:"support" }), "waiting_customer");
  assert.equal(mapHospitalitySupportStatus("assigned"), "in_progress");
  assert.equal(mapHospitalitySupportStatus("closed"), "resolved");
  assert.equal(mapHospitalitySupportStatus("closed", { tags:["portal-closed"] }), "closed");
});

test("a customer reply reopens resolved work but cannot reopen permanently closed work", () => {
  assert.equal(statusAfterCustomerReply(), "waiting_support");
  assert.equal(isPermanentlyClosed("resolved"), false);
  assert.equal(isPermanentlyClosed("closed"), true);
});
