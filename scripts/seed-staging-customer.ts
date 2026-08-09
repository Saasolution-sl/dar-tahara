/**
 * Seeds a complete, loginable customer fixture on the STAGING project so the
 * customer portal - and /account/appointments in particular - has something
 * real to render. Staging starts empty, so this builds the whole chain:
 *
 *   auth user -> customers -> properties -> staff_members
 *             -> home_assessments -> subscriptions -> invoices
 *             -> service_bookings (6 per property, one per display state)
 *
 * It also enables `customer_portal_enabled`, which defaults off.
 *
 * Idempotent: re-running reuses the auth user and upserts by natural key, and
 * bookings/invoices tagged with MARKER are deleted and rebuilt each run.
 *
 * Run:
 *   npx tsx scripts/seed-staging-customer.ts
 *
 * Reads SUPABASE_URL / SUPABASE_SECRET_KEY, falling back to the NEXT_PUBLIC_*
 * names that .env.local already sets.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const STAGING_PROJECT_REF = "ehzrroohsmwdkebezhiy";
const MARKER = "SEED:appointments-demo";
const CUSTOMER_EMAIL = "customer.test@dartahara.local";

// .env.local is the only place these live locally; tsx does not load it itself.
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !secret) throw new Error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY.");
if (!url.includes(STAGING_PROJECT_REF)) {
  throw new Error(
    `Refusing to run against ${url}. This seeder is for the staging project (${STAGING_PROJECT_REF}) only.`,
  );
}

const db = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

function iso(daysFromToday: number, hours = 0, minutes = 0): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
}
function day(daysFromToday: number): string {
  return iso(daysFromToday).slice(0, 10);
}
type Row = { id: string };

/**
 * Unwraps a single-row PostgREST result, throwing on either an error or a
 * missing row. The client is untyped here (no generated Database types in this
 * script), so the caller states the shape it expects.
 */
function check<T>(label: string, result: { data: unknown; error: unknown }): T {
  if (result.error) throw new Error(`${label}: ${JSON.stringify(result.error)}`);
  if (result.data == null) throw new Error(`${label}: no row returned`);
  return result.data as T;
}

const PROPERTIES = [
  { address_line1: "12 Rue des Oliviers", city: "Tangier", frequency: "biweekly" as const },
  { address_line1: "45 Avenue Hassan II", city: "Rabat", frequency: "weekly" as const },
  { address_line1: "8 Boulevard Zerktouni", city: "Casablanca", frequency: "monthly" as const },
];

/** day offset, booking status, exact time known, employee assigned */
const BOOKINGS: Array<[number, string, boolean, boolean]> = [
  [-38, "completed", true, true],
  [-11, "confirmed", false, true], // window has passed -> reads as awaiting_update
  [0, "in_progress", true, true],
  [6, "confirmed", true, true],
  [20, "planning", false, false],
  [27, "cancelled", false, false],
];

async function findAuthUserByEmail(email: string): Promise<string | null> {
  // listUsers is paginated and has no email filter; staging is small enough
  // that one page is plenty, and this keeps the script dependency-free.
  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`listUsers: ${error.message}`);
  return data.users.find((user) => user.email === email)?.id || null;
}

async function main() {
  const password = process.env.SEED_CUSTOMER_PASSWORD;
  if (!password) {
    throw new Error(
      "Set SEED_CUSTOMER_PASSWORD to the password the test customer should log in with.",
    );
  }

  console.log(`Seeding staging (${STAGING_PROJECT_REF})…`);

  // 1. Auth user - reused if it already exists, so re-runs never orphan a login.
  let authUserId = await findAuthUserByEmail(CUSTOMER_EMAIL);
  if (authUserId) {
    const { error } = await db.auth.admin.updateUserById(authUserId, {
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`updateUser: ${error.message}`);
    console.log("  auth user: reused");
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email: CUSTOMER_EMAIL,
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`createUser: ${error.message}`);
    authUserId = data.user.id;
    console.log("  auth user: created");
  }

  const role = await db
    .from("user_roles")
    .upsert({ user_id: authUserId, role: "customer" }, { onConflict: "user_id,role" });
  if (role.error) throw new Error(`user_roles: ${JSON.stringify(role.error)}`);

  // 2. Customer
  const customer = check<Row>(
    "customers",
    await db
      .from("customers")
      .upsert(
        {
          auth_user_id: authUserId,
          email: CUSTOMER_EMAIL,
          full_name: "Test Customer",
          phone: "+212600000000",
          preferred_language: "en",
          status: "customer",
          email_verified_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      )
      .select("id")
      .single(),
  );

  // 3. Employee. The assessment-completeness trigger requires an ACTIVE staff
  // member with a non-blank employee_number, and the portal shows that number
  // rather than the person's name.
  const staff = check<Row>(
    "staff_members",
    await db
      .from("staff_members")
      .upsert(
        {
          full_name: "Staging Cleaner",
          role: "cleaner",
          employee_number: "EMP-STG-001",
          active: true,
        },
        { onConflict: "employee_number" },
      )
      .select("id")
      .single(),
  );

  // 4. Feature flag - the portal is gated on this and defaults off. UPDATE, not
  //    upsert: the row is seeded by migration and carries NOT NULL name/description
  //    an upsert-insert would have to invent (and silently fail on).
  const flag = await db
    .from("feature_flags")
    .update({ enabled: true })
    .eq("key", "customer_portal_enabled")
    .select("key");
  if (flag.error) throw new Error(`feature_flags: ${JSON.stringify(flag.error)}`);
  if (!flag.data?.length) throw new Error("feature_flags: customer_portal_enabled row not found");

  // 5. Clear this script's previous bookings/invoices. Bookings first:
  //    source_invoice_id is ON DELETE RESTRICT.
  const { data: oldBookings } = await db
    .from("service_bookings")
    .select("id,source_invoice_id")
    .eq("notes", MARKER);
  if (oldBookings?.length) {
    await db.from("service_bookings").delete().eq("notes", MARKER);
    await db
      .from("invoices")
      .delete()
      .in("id", oldBookings.map((booking) => booking.source_invoice_id));
  }
  await db.from("invoices").delete().eq("invoice_number", MARKER);

  let bookingCount = 0;

  for (const spec of PROPERTIES) {
    // 6. Property. Every field the completeness trigger checks is populated;
    //    a missing one fails with a bare 'assessment_property_fields_required'.
    const existing = await db
      .from("properties")
      .select("id")
      .eq("customer_id", customer.id)
      .eq("address_line1", spec.address_line1)
      .maybeSingle();

    const propertyPayload = {
      customer_id: customer.id,
      address_line1: spec.address_line1,
      city: spec.city,
      country_code: "MA",
      declared_size_m2: 120,
      declared_bedrooms: 3,
      declared_bathrooms: 2,
      property_type: "apartment",
      access_method: "keys_with_concierge",
      air_conditioning_units: 2,
      kitchen_count: 1,
      living_space_count: 1,
      outside_spaces: ["balcony"],
    };
    const property = existing.data
      ? check<Row>(
          "properties update",
          await db
            .from("properties")
            .update(propertyPayload)
            .eq("id", existing.data.id)
            .select("id")
            .single(),
        )
      : check<Row>(
          "properties insert",
          await db.from("properties").insert(propertyPayload).select("id").single(),
        );

    // 7. Assessment, already completed and approved so a subscription can hang
    //    off it. scheduled_at + assessment_completed_at + an active employee are
    //    all required by the trigger for these statuses.
    const existingAssessment = await db
      .from("home_assessments")
      .select("id")
      .eq("property_id", property.id)
      .maybeSingle();

    const assessmentPayload = {
      customer_id: customer.id,
      property_id: property.id,
      status: "subscription_active",
      payment_status: "paid",
      requested_frequency: spec.frequency,
      requested_billing_interval: "monthly",
      assessment_price_cents: 50000,
      preferred_date: day(-60),
      preferred_time_slot: "morning",
      scheduled_at: iso(-58, 9),
      assessment_completed_at: iso(-58, 11),
      assigned_staff_id: staff.id,
      legal_acceptance: { terms: true, privacy: true, accepted_at: iso(-60) },
      terms_version: "2026-07-01",
    };
    const assessment = existingAssessment.data
      ? check<Row>(
          "assessment update",
          await db
            .from("home_assessments")
            .update(assessmentPayload)
            .eq("id", existingAssessment.data.id)
            .select("id")
            .single(),
        )
      : check<Row>(
          "assessment insert",
          await db.from("home_assessments").insert(assessmentPayload).select("id").single(),
        );

    // 8. Subscription (assessment_id is UNIQUE, so it doubles as the key).
    const subscription = check<Row>(
      "subscriptions",
      await db
        .from("subscriptions")
        .upsert(
          {
            customer_id: customer.id,
            property_id: property.id,
            assessment_id: assessment.id,
            status: "active",
            frequency: spec.frequency,
            billing_interval: "monthly",
            monthly_price_cents: 45000,
            billed_price_cents: 45000,
          },
          { onConflict: "assessment_id" },
        )
        .select("id")
        .single(),
    );

    // 9. Bookings, one per display state, each with its own invoice because
    //    service_bookings.source_invoice_id is NOT NULL and UNIQUE.
    for (const [offset, status, exactTime, withStaff] of BOOKINGS) {
      const invoice = check<Row>(
        "invoices",
        await db
          .from("invoices")
          .insert({
            customer_id: customer.id,
            subscription_id: subscription.id,
            status: "paid",
            amount_due_cents: 4500,
            amount_paid_cents: 4500,
            currency: "eur",
            invoice_number: MARKER,
          })
          .select("id")
          .single(),
      );

      const { error } = await db.from("service_bookings").insert({
        customer_id: customer.id,
        property_id: property.id,
        subscription_id: subscription.id,
        assessment_id: assessment.id,
        source_invoice_id: invoice.id,
        status,
        service_window_start: day(offset),
        service_window_end: day(offset + 6),
        scheduled_start: exactTime ? iso(offset, 9) : null,
        scheduled_end: exactTime ? iso(offset, 11, 30) : null,
        assigned_staff_id: withStaff ? staff.id : null,
        notes: MARKER,
      });
      if (error) throw new Error(`service_bookings: ${JSON.stringify(error)}`);
      bookingCount += 1;
    }

    console.log(`  ${spec.address_line1}, ${spec.city}: ${BOOKINGS.length} bookings`);
  }

  console.log(`\nDone. ${bookingCount} bookings across ${PROPERTIES.length} properties.`);
  console.log(`Log in at http://localhost:3200 as ${CUSTOMER_EMAIL}`);
}

main().catch((error) => {
  console.error(`\nSeed failed: ${error.message}`);
  process.exit(1);
});
