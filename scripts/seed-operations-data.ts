/**
 * Seeds a realistic demo dataset for the Operations Center dashboard:
 * offices, a demo staff roster, demo customers/properties, weeks of
 * service_visits (+ quality_inspections, customer_complaints), staff live
 * status, and inventory. Demo staff/customers are plain rows with no
 * auth_user_id, they never need to log in, they only need to exist so the
 * dashboard's leaderboards/comparisons/maps have something to show.
 *
 * Real existing customers/staff/offices are left untouched; this only adds
 * new rows. Run manually:
 *   SUPABASE_URL=... SUPABASE_SECRET_KEY=... npx tsx scripts/seed-operations-data.ts
 */
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "sadyszicqxqslskotyta";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !secret) throw new Error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY.");
if (!url.includes(PRODUCTION_PROJECT_REF)) throw new Error(`Refusing to run against a project other than ${PRODUCTION_PROJECT_REF}.`);

const db = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });

function rand<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function jitter(center: number, spreadKm: number): number {
  return center + (Math.random() - 0.5) * (spreadKm / 111);
}

const OFFICES = [
  { name: "Tangier", city: "Tangier", lat: 35.7595, lng: -5.834 },
  { name: "Casablanca", city: "Casablanca", lat: 33.5731, lng: -7.5898 },
  { name: "Marrakech", city: "Marrakech", lat: 31.6295, lng: -7.9811 },
  { name: "Rabat", city: "Rabat", lat: 34.0209, lng: -6.8416 },
];

const FIRST_NAMES = ["Amine", "Youssef", "Salma", "Fatima", "Karim", "Nadia", "Hicham", "Imane", "Reda", "Sara", "Omar", "Layla", "Anas", "Meryem", "Bilal"];
const LAST_NAMES = ["El Amrani", "Benali", "Chraibi", "Idrissi", "Bennis", "Tazi", "Fassi", "Alaoui", "Bakkali", "Ziani"];
function randomName(): string {
  return `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
}

const COMPLAINT_CATEGORIES = ["missed_spot", "late_arrival", "damaged_item", "billing_question", "staff_conduct"];
const INVENTORY_TEMPLATES: Array<{ category: string; name: string; unit: string }> = [
  { category: "cleaning_products", name: "All-purpose cleaner (5L)", unit: "bottle" },
  { category: "cleaning_products", name: "Glass cleaner", unit: "bottle" },
  { category: "cleaning_products", name: "Microfiber cloths", unit: "pack" },
  { category: "uniforms", name: "Polo shirts (M)", unit: "unit" },
  { category: "uniforms", name: "Aprons", unit: "unit" },
  { category: "equipment", name: "Vacuum cleaners", unit: "unit" },
  { category: "equipment", name: "Mop sets", unit: "set" },
  { category: "vehicle_supplies", name: "Fuel cards", unit: "card" },
];

async function main() {
  console.log(`Seeding demo operations data into ${url}...`);

  const officeIds: Record<string, string> = {};
  for (const office of OFFICES) {
    const { data, error } = await db.from("offices").insert({ name: office.name, city: office.city }).select("id").single();
    if (error) throw error;
    officeIds[office.name] = data.id;
  }
  console.log(`Created ${OFFICES.length} offices.`);

  for (const office of OFFICES) {
    const officeId = officeIds[office.name];
    const staffRoster = [
      ...Array.from({ length: 4 }, () => ({ role: "cleaner" })),
      { role: "inspector" }, { role: "coordinator" }, { role: "manager" },
    ];
    const staffIds: string[] = [];
    for (const staff of staffRoster) {
      const fullName = randomName();
      const employeeNumber = `${staff.role.slice(0, 3).toUpperCase()}-DEMO-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const { data, error } = await db
        .from("staff_members")
        .insert({
          full_name: fullName,
          email: `${fullName.toLowerCase().replace(/\s+/g, ".")}.${Math.random().toString(36).slice(2, 6)}@demo.dartahara.com`,
          phone: `+2126${randInt(10000000, 99999999)}`,
          role: staff.role,
          employee_number: employeeNumber,
          active: true,
          office_id: officeId,
        })
        .select("id")
        .single();
      if (error) throw error;
      staffIds.push(data.id);
    }

    const customerIds: string[] = [];
    const propertyByCustomer: Record<string, string> = {};
    const coordsByCustomer: Record<string, { lat: number; lng: number }> = {};
    const customerCount = randInt(15, 25);
    for (let i = 0; i < customerCount; i++) {
      const fullName = randomName();
      const { data: customer, error: customerError } = await db
        .from("customers")
        .insert({
          full_name: fullName,
          first_name: fullName.split(" ")[0],
          last_name: fullName.split(" ").slice(1).join(" "),
          email: `${fullName.toLowerCase().replace(/\s+/g, ".")}.${Math.random().toString(36).slice(2, 6)}@demo-customer.com`,
          phone: `+2126${randInt(10000000, 99999999)}`,
          status: "customer",
          office_id: officeId,
          created_at: new Date(Date.now() - randInt(10, 400) * 86400000).toISOString(),
        })
        .select("id")
        .single();
      if (customerError) throw customerError;
      customerIds.push(customer.id);

      // The operational `properties` table has no coordinate columns (those
      // live on the unrelated marketing `cleaning_properties` lead table),
      // keep this customer's location in memory and stamp it onto their
      // service_visits rows instead (see service_visits_coordinates migration).
      coordsByCustomer[customer.id] = { lat: jitter(office.lat, 8), lng: jitter(office.lng, 8) };

      const { data: property, error: propertyError } = await db
        .from("properties")
        .insert({
          customer_id: customer.id,
          address_line1: `${randInt(1, 200)} Rue ${rand(LAST_NAMES)}`,
          city: office.city,
          country_code: "MA",
          declared_size_m2: randInt(50, 220),
          declared_bedrooms: randInt(1, 5),
          declared_bathrooms: randInt(1, 3),
        })
        .select("id")
        .single();
      if (propertyError) throw propertyError;
      propertyByCustomer[customer.id] = property.id;
    }

    // Visit history: last 30 days + today + next 2 days.
    const fieldStaff = staffIds.slice(0, 4); // cleaners only get assigned visits
    const visitRows: Array<Record<string, unknown>> = [];
    for (let dayOffset = -30; dayOffset <= 2; dayOffset++) {
      const visitsToday = randInt(3, 7);
      for (let v = 0; v < visitsToday; v++) {
        const customerId = rand(customerIds);
        const staffId = rand(fieldStaff);
        const hour = randInt(8, 16);
        const start = new Date();
        start.setDate(start.getDate() + dayOffset);
        start.setHours(hour, rand([0, 30]), 0, 0);
        const durationMinutes = randInt(60, 150);
        const end = new Date(start.getTime() + durationMinutes * 60000);

        let status: string;
        if (dayOffset < 0) status = rand(["completed", "completed", "completed", "completed", "cancelled", "delayed"]);
        else if (dayOffset === 0) status = rand(["completed", "working", "driving", "scheduled", "delayed"]);
        else status = "scheduled";

        const isPast = dayOffset < 0 || (dayOffset === 0 && status === "completed");
        const rating = isPast && status === "completed" ? rand([3, 4, 4, 5, 5, 5]) : null;

        visitRows.push({
          office_id: officeId,
          customer_id: customerId,
          property_id: propertyByCustomer[customerId],
          assigned_staff_id: staffId,
          scheduled_start: start.toISOString(),
          scheduled_end: end.toISOString(),
          actual_start: isPast ? start.toISOString() : null,
          actual_end: status === "completed" ? end.toISOString() : null,
          status,
          travel_minutes: isPast ? randInt(10, 45) : null,
          cleaning_minutes: status === "completed" ? durationMinutes : null,
          customer_rating: rating,
          is_revisit: isPast && Math.random() < 0.05,
          lat: coordsByCustomer[customerId].lat,
          lng: coordsByCustomer[customerId].lng,
        });
      }
    }
    const { data: insertedVisits, error: visitsError } = await db.from("service_visits").insert(visitRows).select("id, status, scheduled_start, assigned_staff_id");
    if (visitsError) throw visitsError;

    // Quality inspections for a sample of completed visits.
    const completedVisits = insertedVisits.filter((v) => v.status === "completed");
    const inspectionSample = completedVisits.filter(() => Math.random() < 0.4);
    if (inspectionSample.length > 0) {
      const { error } = await db.from("quality_inspections").insert(
        inspectionSample.map((visit) => ({
          visit_id: visit.id,
          inspector_staff_id: staffIds[4],
          score: randInt(78, 100),
          first_time_right: Math.random() > 0.1,
        })),
      );
      if (error) throw error;
    }

    // Complaints.
    const complaintCount = randInt(1, 4);
    const complaintRows = Array.from({ length: complaintCount }, () => ({
      office_id: officeId,
      customer_id: rand(customerIds),
      category: rand(COMPLAINT_CATEGORIES),
      status: rand(["pending", "resolved", "resolved"]),
      is_recurring: Math.random() < 0.2,
      created_at: new Date(Date.now() - randInt(0, 25) * 86400000).toISOString(),
    }));
    const { error: complaintsError } = await db.from("customer_complaints").insert(complaintRows);
    if (complaintsError) throw complaintsError;

    // Live status for today, wired to today's visits where possible.
    const todaysVisits = insertedVisits.filter((v) => new Date(v.scheduled_start).toDateString() === new Date().toDateString());
    for (const staffId of fieldStaff) {
      const staffTodaysVisits = todaysVisits.filter((v) => v.assigned_staff_id === staffId).sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start));
      const current = staffTodaysVisits.find((v) => v.status === "working" || v.status === "driving");
      const next = staffTodaysVisits.find((v) => v.status === "scheduled");
      const status = current ? current.status : rand(["waiting", "finished", "break", "offline"]);
      const { error } = await db.from("staff_live_status").insert({
        staff_id: staffId,
        office_id: officeId,
        status,
        current_visit_id: current?.id || null,
        next_visit_id: next?.id || null,
        lat: jitter(office.lat, 6),
        lng: jitter(office.lng, 6),
      });
      if (error) throw error;
    }

    // Inventory, with a couple of items deliberately low.
    const items = INVENTORY_TEMPLATES.map((item, index) => ({
      office_id: officeId,
      category: item.category,
      name: item.name,
      quantity: index % 4 === 0 ? randInt(0, 3) : randInt(15, 60),
      unit: item.unit,
      reorder_threshold: 10,
    }));
    const { data: insertedItems, error: itemsError } = await db.from("inventory_items").insert(items).select("id, quantity, reorder_threshold");
    if (itemsError) throw itemsError;

    const lowStockItems = insertedItems.filter((item) => item.quantity <= item.reorder_threshold);
    if (lowStockItems.length > 0) {
      const { error } = await db.from("inventory_restock_requests").insert(
        lowStockItems.map((item) => ({ item_id: item.id, office_id: officeId, quantity_requested: 30, status: "pending" })),
      );
      if (error) throw error;
    }

    console.log(`  ${office.name}: ${staffRoster.length} staff, ${customerCount} customers, ${visitRows.length} visits.`);
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
