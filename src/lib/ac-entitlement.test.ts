import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateAcMaintenanceBooking,
  validateAcReplacement,
  type AcUnitForBookingCheck,
  type EntitlementForBookingCheck,
} from "./ac-entitlement";

const PROPERTY_ID = "11111111-1111-1111-1111-111111111111";
const LIVING_ROOM_ID = "22222222-2222-2222-2222-222222222222";
const BEDROOM_ID = "33333333-3333-3333-3333-333333333333";

function livingRoom(overrides: Partial<AcUnitForBookingCheck> = {}): AcUnitForBookingCheck {
  return { id: LIVING_ROOM_ID, propertyId: PROPERTY_ID, status: "active", ...overrides };
}

function bedroom(overrides: Partial<AcUnitForBookingCheck> = {}): AcUnitForBookingCheck {
  return { id: BEDROOM_ID, propertyId: PROPERTY_ID, status: "active", ...overrides };
}

function entitlement(overrides: Partial<EntitlementForBookingCheck> = {}): EntitlementForBookingCheck {
  return {
    id: "e1", acUnitId: LIVING_ROOM_ID, status: "available",
    serviceWindowStart: "2026-09-15", serviceWindowEnd: "2027-03-14",
    ...overrides,
  };
}

const OWNED = { id: PROPERTY_ID, customerOwnsProperty: true };
const TODAY = new Date("2026-10-01T00:00:00.000Z");

test("first maintenance can be booked when everything is valid", () => {
  const result = validateAcMaintenanceBooking(OWNED, livingRoom(), entitlement(), "active", TODAY);
  assert.deepEqual(result, { ok: true });
});

test("the same entitlement cannot be booked twice", () => {
  const used = entitlement({ status: "booked" });
  const result = validateAcMaintenanceBooking(OWNED, livingRoom(), used, "active", TODAY);
  assert.deepEqual(result, { ok: false, error: "entitlement_not_available" });
});

test("a completed entitlement cannot be re-booked", () => {
  const done = entitlement({ status: "completed" });
  const result = validateAcMaintenanceBooking(OWNED, livingRoom(), done, "active", TODAY);
  assert.deepEqual(result, { ok: false, error: "entitlement_not_available" });
});

test("§47 scenario: switching which AC is 'included' cannot unlock a second free visit on the wrong unit", () => {
  // Living Room's own second-window entitlement is still available...
  const livingRoomWindow2 = entitlement({ id: "e2", acUnitId: LIVING_ROOM_ID, status: "available" });
  // ...but a request trying to consume it against the Bedroom unit (as if
  // the included AC had simply been swapped client-side) must fail: the
  // entitlement belongs to a different physical unit.
  const result = validateAcMaintenanceBooking(OWNED, bedroom(), livingRoomWindow2, "active", TODAY);
  assert.deepEqual(result, { ok: false, error: "entitlement_ac_unit_mismatch" });
});

test("a separate, genuinely paid-for unit still books its own entitlement fine", () => {
  const bedroomEntitlement = entitlement({ id: "e3", acUnitId: BEDROOM_ID, status: "available" });
  const result = validateAcMaintenanceBooking(OWNED, bedroom(), bedroomEntitlement, "active", TODAY);
  assert.deepEqual(result, { ok: true });
});

test("second maintenance window works once it opens", () => {
  const window2 = entitlement({
    id: "e2", status: "available",
    serviceWindowStart: "2027-03-15", serviceWindowEnd: "2027-09-14",
  });
  const result = validateAcMaintenanceBooking(OWNED, livingRoom(), window2, "active", new Date("2027-04-01T00:00:00.000Z"));
  assert.deepEqual(result, { ok: true });
});

test("a future window cannot be booked before it opens", () => {
  const window2 = entitlement({
    id: "e2", status: "available",
    serviceWindowStart: "2027-03-15", serviceWindowEnd: "2027-09-14",
  });
  const result = validateAcMaintenanceBooking(OWNED, livingRoom(), window2, "active", TODAY);
  assert.deepEqual(result, { ok: false, error: "service_window_not_open" });
});

test("an expired subscription cannot consume a future entitlement", () => {
  const result = validateAcMaintenanceBooking(OWNED, livingRoom(), entitlement(), "cancelled", TODAY);
  assert.deepEqual(result, { ok: false, error: "subscription_not_active" });
});

test("an inactive AC unit cannot be booked even with a valid entitlement", () => {
  const result = validateAcMaintenanceBooking(OWNED, livingRoom({ status: "retired" }), entitlement(), "active", TODAY);
  assert.deepEqual(result, { ok: false, error: "ac_unit_not_active" });
});

test("a customer cannot book maintenance on a property they do not own", () => {
  const result = validateAcMaintenanceBooking(
    { id: PROPERTY_ID, customerOwnsProperty: false }, livingRoom(), entitlement(), "active", TODAY,
  );
  assert.deepEqual(result, { ok: false, error: "not_found" });
});

test("an AC unit belonging to a different property is rejected", () => {
  const foreignUnit = livingRoom({ propertyId: "99999999-9999-9999-9999-999999999999" });
  const result = validateAcMaintenanceBooking(OWNED, foreignUnit, entitlement(), "active", TODAY);
  assert.deepEqual(result, { ok: false, error: "ac_unit_property_mismatch" });
});

test("replacement is allowed for every legitimate reason", () => {
  for (const reason of ["removed", "replaced", "moved_property", "incorrect_before_maintenance", "admin_correction"]) {
    const result = validateAcReplacement({ status: "active", hasCompletedMaintenance: false }, reason);
    assert.deepEqual(result, { ok: true }, reason);
  }
});

test("an arbitrary reason is rejected", () => {
  const result = validateAcReplacement({ status: "active", hasCompletedMaintenance: false }, "i_feel_like_it");
  assert.deepEqual(result, { ok: false, error: "invalid_replacement_reason" });
});

test("'incorrect unit registered' cannot be claimed once maintenance has already been performed", () => {
  const result = validateAcReplacement(
    { status: "active", hasCompletedMaintenance: true }, "incorrect_before_maintenance",
  );
  assert.deepEqual(result, { ok: false, error: "maintenance_already_performed" });
});

test("a genuine replacement/removal reason still works after maintenance was performed", () => {
  const result = validateAcReplacement({ status: "active", hasCompletedMaintenance: true }, "replaced");
  assert.deepEqual(result, { ok: true });
});

test("an already-retired unit cannot be replaced again", () => {
  const result = validateAcReplacement({ status: "retired", hasCompletedMaintenance: true }, "replaced");
  assert.deepEqual(result, { ok: false, error: "included_unit_not_active" });
});
