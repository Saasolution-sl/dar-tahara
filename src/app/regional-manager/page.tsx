import { requireRole } from "@/lib/portal-auth";
import { serviceSelect } from "@/lib/supabase-rpc";

type Office = { id: string; name: string; city: string | null };

export default async function RegionalManagerOverview() {
  const context = await requireRole(["regional_manager", "administrator"]);
  const officeIds = context.officeIds;

  if (officeIds.length === 0) {
    return (
      <section>
        <h1 className="font-serif text-3xl">Overview</h1>
        <p className="mt-4 text-sm text-muted-foreground">No offices are assigned to your account yet. Ask an administrator to assign one from Offices management.</p>
      </section>
    );
  }

  const [offices, customerRows, staffRows] = await Promise.all([
    serviceSelect<Office[]>(`offices?id=in.(${officeIds.join(",")})&select=id,name,city&order=name.asc`),
    serviceSelect<Array<{ office_id: string }>>(`customers?office_id=in.(${officeIds.join(",")})&select=office_id`),
    serviceSelect<Array<{ office_id: string }>>(`staff_members?office_id=in.(${officeIds.join(",")})&select=office_id`),
  ]);

  const customerCounts = new Map<string, number>();
  for (const row of customerRows) customerCounts.set(row.office_id, (customerCounts.get(row.office_id) || 0) + 1);
  const staffCounts = new Map<string, number>();
  for (const row of staffRows) staffCounts.set(row.office_id, (staffCounts.get(row.office_id) || 0) + 1);

  return (
    <section>
      <h1 className="font-serif text-3xl">Overview</h1>
      <p className="mt-2 text-sm text-muted-foreground">Offices under your management.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {offices.map((office) => (
          <div key={office.id} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl">{office.name}</h2>
            {office.city ? <p className="text-sm text-muted-foreground">{office.city}</p> : null}
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Customers</dt><dd className="text-lg font-semibold">{customerCounts.get(office.id) || 0}</dd></div>
              <div><dt className="text-muted-foreground">Personnel</dt><dd className="text-lg font-semibold">{staffCounts.get(office.id) || 0}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
