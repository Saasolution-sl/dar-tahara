"use client";

import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { StatusActionButton } from "@/components/admin/status-action-button";
import { OfficeAssignSelect } from "@/components/admin/office-assign-select";

type Profile = { id: string; full_name: string; email: string; phone: string; role: "assessment" | "manager" | "regional_manager"; employee_number: string; active: boolean; office_id: string | null; created_at: string };
type Office = { id: string; name: string };

export function TeamProfilesClient({ canInvite = true }: { canInvite?: boolean }) {
  const [profiles, setProfiles] = React.useState<Profile[]>([]); const [offices, setOffices] = React.useState<Office[]>([]); const [loading, setLoading] = React.useState(true); const [message, setMessage] = React.useState("");
  const load = React.useCallback(async () => {
    setLoading(true);
    const teamResponse = await fetch("/api/admin/team", { cache: "no-store" });
    const teamData = await teamResponse.json().catch(() => null);
    setLoading(false);
    if (!teamResponse.ok) { setMessage(teamData?.error || "Team profiles could not be loaded."); return; }
    setProfiles(teamData.profiles);
    if (canInvite) {
      const officesResponse = await fetch("/api/admin/offices", { cache: "no-store" });
      const officesData = await officesResponse.json().catch(() => null);
      if (officesResponse.ok) setOffices(officesData.offices);
    }
  }, [canInvite]);
  React.useEffect(() => { void load(); }, [load]);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setMessage("Sending invitation..."); const form = new FormData(event.currentTarget); const response = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) }); const data = await response.json().catch(() => null); if (!response.ok) { setMessage(data?.error || "Profile could not be created."); return; } event.currentTarget.reset(); setMessage(`Invitation sent. Employee ID: ${data.employeeNumber}`); await load(); }
  return <section><p className="text-xs font-semibold uppercase tracking-[.18em] text-accent">Access management</p><h1 className="mt-2 font-serif text-3xl">Team profiles</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Create separate Manager and Assessment employee accounts. An invitation is emailed to the employee; permissions come from the protected role record, not their profile metadata.</p>{canInvite ? <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card p-5"><h2 className="font-serif text-xl">Invite a team member</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field name="fullName" label="Full name" /><Field name="email" label="Work email" type="email" /><Field name="phone" label="Phone" type="tel" /><label className="text-sm font-medium">Profile <span className="text-accent">*</span><select className="input mt-2" name="role" required><option value="assessment">Assessment employee</option><option value="manager">Manager</option><option value="regional_manager">Regional manager</option></select></label></div><button className={`${buttonVariants({ variant: "primary", size: "md" })} mt-5`}>Create profile and send invitation</button>{message ? <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p> : null}</form> : null}<div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground"><tr><th className="p-4">Name</th><th className="p-4">Profile</th><th className="p-4">Employee ID</th><th className="p-4">Contact</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{profiles.map(profile => <tr key={profile.id} className="border-b border-border last:border-0"><td className="p-4 font-medium">{profile.full_name}</td><td className="p-4 capitalize">{profile.role.replace("_", " ")}</td><td className="p-4 font-mono text-xs">{profile.employee_number}</td><td className="p-4"><p>{profile.email}</p><p className="text-muted-foreground">{profile.phone}</p></td><td className="p-4">{profile.active ? "Active" : "Inactive"}</td><td className="p-4"><div className="flex flex-col gap-1"><StatusActionButton active={!profile.active} activeLabel="Reactivate" inactiveLabel="Deactivate" onToggle={async () => { const response = await fetch(`/api/admin/team/${profile.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !profile.active }) }); if (response.ok) await load(); return response; }} />{canInvite ? <OfficeAssignSelect targetId={profile.id} kind="staff" currentOfficeId={profile.office_id} offices={offices} /> : null}</div></td></tr>)}</tbody></table>{!loading && !profiles.length ? <p className="p-8 text-center text-sm text-muted-foreground">No Manager or Assessment profiles yet.</p> : null}{loading ? <p className="p-8 text-center text-sm text-muted-foreground">Loading profiles...</p> : null}</div></section>;
}
function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) { return <label className="text-sm font-medium">{label} <span className="text-accent">*</span><input className="input mt-2" name={name} type={type} required /></label>; }
