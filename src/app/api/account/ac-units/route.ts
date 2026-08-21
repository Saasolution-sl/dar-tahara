import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

const ROOM_TYPES = [
  "living_room", "master_bedroom", "bedroom_2", "bedroom_3", "guest_room",
  "kitchen", "office", "hallway", "dining_room", "other",
] as const;

const ROOM_LABELS: Record<(typeof ROOM_TYPES)[number], string> = {
  living_room: "Living room", master_bedroom: "Master bedroom", bedroom_2: "Bedroom 2",
  bedroom_3: "Bedroom 3", guest_room: "Guest room", kitchen: "Kitchen", office: "Office",
  hallway: "Hallway", dining_room: "Dining room", other: "",
};

type PropertyRow = { id: string; customer_id: string };
type CustomerRow = { email: string; full_name: string; preferred_language: Locale };

/**
 * Registers a physical AC unit for a property the caller owns. Never charges
 * or activates paid coverage here (coverage_type/status default to
 * 'paid_addon'/'active'; designating the included unit or adding paid
 * billing is a separate, explicit step) so registering a unit is always
 * free and safe, matching the spec's "existing subscribers can register
 * their included AC without being blocked."
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["customer", "staff", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const propertyId = typeof body.propertyId === "string" ? body.propertyId : "";
  const roomType = typeof body.roomType === "string" ? body.roomType : "";
  const roomLabel = typeof body.roomLabel === "string" ? body.roomLabel.trim().slice(0, 200) : null;
  if (!/^[0-9a-f-]{36}$/i.test(propertyId)) return NextResponse.json({ error: "invalid_property" }, { status: 400 });
  if (!ROOM_TYPES.includes(roomType as (typeof ROOM_TYPES)[number])) {
    return NextResponse.json({ error: "invalid_room_type" }, { status: 400 });
  }
  if (roomType === "other" && !roomLabel) {
    return NextResponse.json({ error: "room_label_required" }, { status: 400 });
  }

  const properties = await serviceSelect<PropertyRow[]>(
    `properties?id=eq.${propertyId}&select=id,customer_id&limit=1`,
  );
  const property = properties[0];
  if (!property || property.customer_id !== auth.context.customerId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const subscriptionRows = await serviceSelect<Array<{ id: string }>>(
    `subscriptions?property_id=eq.${propertyId}&select=id&order=created_at.desc&limit=1`,
  );
  const subscriptionId = subscriptionRows[0]?.id;
  if (!subscriptionId) return NextResponse.json({ error: "no_subscription_for_property" }, { status: 409 });

  const optionalFields = {
    floor: typeof body.floor === "string" ? body.floor.trim().slice(0, 50) || null : null,
    brand: typeof body.brand === "string" ? body.brand.trim().slice(0, 100) || null : null,
    model: typeof body.model === "string" ? body.model.trim().slice(0, 100) || null : null,
    serial_number: typeof body.serialNumber === "string" ? body.serialNumber.trim().slice(0, 100) || null : null,
    location_notes: typeof body.locationNotes === "string" ? body.locationNotes.trim().slice(0, 500) || null : null,
  };

  const [created] = await serviceInsert<Array<{ id: string; unit_code: string }>>("ac_units", {
    customer_id: auth.context.customerId,
    property_id: propertyId,
    subscription_id: subscriptionId,
    room_type: roomType,
    room_label: roomLabel,
    coverage_type: "paid_addon",
    status: "active",
    coverage_started_at: new Date().toISOString(),
    ...optionalFields,
  });
  if (!created) return NextResponse.json({ error: "create_failed" }, { status: 500 });

  const [customer] = await serviceSelect<CustomerRow[]>(
    `customers?id=eq.${auth.context.customerId}&select=email,full_name,preferred_language&limit=1`,
  );
  if (customer) {
    // room_label, when the customer supplied one, is already in whatever
    // language they typed it in; ROOM_LABELS is an English fallback only --
    // see Outstanding Issues in the deliverables report re: full i18n for
    // the room-type vocabulary itself.
    const details = roomLabel || ROOM_LABELS[roomType as (typeof ROOM_TYPES)[number]] || roomType;
    await sendTransactionalEmail({
      template: "ac_registered", locale: customer.preferred_language,
      email: customer.email, name: customer.full_name,
      details, reference: created.unit_code,
    });
  }

  // track() is client-only (no-ops on the server); the "ac_registered"
  // analytics event fires from the calling UI component once this request
  // resolves successfully, same pattern as mailing_list_signup_completed.
  return NextResponse.json({ ok: true, id: created.id, unitCode: created.unit_code });
}
