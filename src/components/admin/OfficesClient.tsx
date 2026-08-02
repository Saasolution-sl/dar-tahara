"use client";

import * as React from "react";
import { buttonVariants } from "@/components/ui/button";

type RegionalManager = { auth_user_id: string; full_name: string; email: string };
type Office = { id: string; name: string; city: string | null; regionalManagers: Array<{ userId: string; name: string }> };

export function OfficesClient() {
  const [offices, setOffices] = React.useState<Office[]>([]);
  const [regionalManagers, setRegionalManagers] = React.useState<RegionalManager[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/offices", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    setLoading(false);
    if (!response.ok) { setMessage(data?.error || "Offices could not be loaded."); return; }
    setOffices(data.offices);
    setRegionalManagers(data.regionalManagers);
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function createOffice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/offices", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), city: form.get("city") }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) { setMessage(data?.error || "Office could not be created."); return; }
    event.currentTarget.reset();
    await load();
  }

  async function assignManager(officeId: string, userId: string) {
    if (!userId) return;
    await fetch(`/api/admin/offices/${officeId}/managers`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }),
    });
    await load();
  }

  async function unassignManager(officeId: string, userId: string) {
    await fetch(`/api/admin/offices/${officeId}/managers?userId=${encodeURIComponent(userId)}`, { method: "DELETE" });
    await load();
  }

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-accent">Access management</p>
      <h1 className="mt-2 font-serif text-3xl">Offices</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Create offices/branches and assign regional managers to oversee them. Invite a Regional manager profile from Team profiles first, then assign them here.</p>

      <form onSubmit={createOffice} className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Add an office</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">Name <span className="text-accent">*</span><input className="input mt-2" name="name" required /></label>
          <label className="text-sm font-medium">City<input className="input mt-2" name="city" /></label>
        </div>
        <button className={`${buttonVariants({ variant: "primary", size: "md" })} mt-5`}>Create office</button>
        {message ? <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {offices.map((office) => (
          <div key={office.id} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl">{office.name}</h2>
            {office.city ? <p className="text-sm text-muted-foreground">{office.city}</p> : null}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Regional managers</p>
              <ul className="mt-2 space-y-1">
                {office.regionalManagers.map((manager) => (
                  <li key={manager.userId} className="flex items-center justify-between gap-2 text-sm">
                    <span>{manager.name}</span>
                    <button type="button" onClick={() => unassignManager(office.id, manager.userId)} className="text-xs text-red-600 hover:underline">Remove</button>
                  </li>
                ))}
                {!office.regionalManagers.length ? <li className="text-sm text-muted-foreground">None assigned</li> : null}
              </ul>
              <select
                className="input mt-3"
                defaultValue=""
                onChange={(event) => { void assignManager(office.id, event.target.value); event.target.value = ""; }}
              >
                <option value="" disabled>Assign a regional manager…</option>
                {regionalManagers.map((manager) => (
                  <option key={manager.auth_user_id} value={manager.auth_user_id}>{manager.full_name} ({manager.email})</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {!loading && !offices.length ? <p className="text-sm text-muted-foreground">No offices yet.</p> : null}
      </div>
    </section>
  );
}
