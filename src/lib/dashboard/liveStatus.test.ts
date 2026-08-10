import assert from "node:assert/strict";
import test from "node:test";
import {
  ALL_STAFF_STATUSES,
  LIVE_STATUSES,
  countLiveStatuses,
  isLiveStatus,
  isOnShift,
  resolveStatusFilter,
} from "./liveStatus";

/** The exact staging shape that exposed the bug: 16 rows, only 10 of them live. */
const STAGING_SNAPSHOT = [
  ...Array(1).fill({ status: "break" }),
  ...Array(6).fill({ status: "driving" }),
  ...Array(4).fill({ status: "finished" }),
  ...Array(2).fill({ status: "offline" }),
  ...Array(2).fill({ status: "waiting" }),
  ...Array(1).fill({ status: "working" }),
];

test("live count excludes staff who are off the clock", () => {
  const counts = countLiveStatuses(STAGING_SNAPSHOT);

  assert.equal(STAGING_SNAPSHOT.length, 16);
  // The board used to render all 16. Only these four statuses are live.
  assert.equal(counts.live, 10);
  assert.equal(counts.working, 1);
  assert.equal(counts.driving, 6);
  assert.equal(counts.break, 1);
  assert.equal(counts.waiting, 2);
  assert.equal(counts.finished, 4);
  assert.equal(counts.offline, 2);
  assert.equal(counts.sick, 0);
});

test("the live buckets sum to the number of rows the board shows", () => {
  const counts = countLiveStatuses(STAGING_SNAPSHOT);
  assert.equal(counts.working + counts.driving + counts.break + counts.waiting, counts.live);
});

test("employees working counts working and driving only", () => {
  const counts = countLiveStatuses(STAGING_SNAPSHOT);
  assert.equal(counts.onShift, 7);
  // Someone on a break is live but not on shift, so the two numbers differ.
  assert.notEqual(counts.onShift, counts.live);
});

test("unrecognised statuses are ignored rather than bucketed", () => {
  const counts = countLiveStatuses([{ status: "working" }, { status: "on_holiday" }, { status: "" }]);
  assert.equal(counts.working, 1);
  assert.equal(counts.live, 1);
  assert.equal(counts.onShift, 1);
  const total = ALL_STAFF_STATUSES.reduce((sum, status) => sum + counts[status], 0);
  assert.equal(total, 1);
});

test("empty input yields zeroes, not NaN", () => {
  const counts = countLiveStatuses([]);
  assert.equal(counts.live, 0);
  assert.equal(counts.onShift, 0);
  assert.equal(counts.finished, 0);
});

test("status predicates agree with the exported lists", () => {
  assert.equal(isLiveStatus("working"), true);
  assert.equal(isLiveStatus("break"), true);
  assert.equal(isLiveStatus("finished"), false);
  assert.equal(isLiveStatus("offline"), false);
  assert.equal(isOnShift("driving"), true);
  assert.equal(isOnShift("break"), false);
});

test("status filter defaults to the live set and rejects unknown values", () => {
  assert.deepEqual(resolveStatusFilter(undefined), LIVE_STATUSES);
  assert.deepEqual(resolveStatusFilter(""), LIVE_STATUSES);
  assert.deepEqual(resolveStatusFilter("live"), LIVE_STATUSES);
  assert.deepEqual(resolveStatusFilter("all"), ALL_STAFF_STATUSES);
  assert.deepEqual(resolveStatusFilter("on_shift"), ["working", "driving"]);
  assert.deepEqual(resolveStatusFilter("working"), ["working"]);
  assert.deepEqual(resolveStatusFilter("working,finished"), ["working", "finished"]);
  // A bad value must not produce an empty `in.()` filter, which would match nothing.
  assert.deepEqual(resolveStatusFilter("nonsense"), LIVE_STATUSES);
  assert.deepEqual(resolveStatusFilter("working,nonsense"), ["working"]);
});
