"use client";

import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { StatusActionButton } from "@/components/admin/status-action-button";
import { OfficeAssignSelect } from "@/components/admin/office-assign-select";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

type Profile = { id: string; full_name: string; email: string; phone: string; role: "assessment" | "manager" | "regional_manager"; employee_number: string; active: boolean; office_id: string | null; created_at: string };
type Office = { id: string; name: string };

export function TeamProfilesClient({ canInvite = true, copy }: { canInvite?: boolean; copy: DashboardCopy }) {
  const t = copy.team;
  const roleLabel: Record<Profile["role"], string> = { assessment: t.roleAssessment, manager: t.roleManager, regional_manager: t.roleRegionalManager };
  const [profiles, setProfiles] = React.useState<Profile[]>([]); const [offices, setOffices] = React.useState<Office[]>([]); const [loading, setLoading] = React.useState(true); const [message, setMessage] = React.useState("");
  const load = React.useCallback(async () => {
    setLoading(true);
    const teamResponse = await fetch("/api/admin/team", { cache: "no-store" });
    const teamData = await teamResponse.json().catch(() => null);
    setLoading(false);
    if (!teamResponse.ok) { setMessage(teamData?.error || t.loadFailed); return; }
    setProfiles(teamData.profiles);
    if (canInvite) {
      const officesResponse = await fetch("/api/admin/offices", { cache: "no-store" });
      const officesData = await officesResponse.json().catch(() => null);
      if (officesResponse.ok) setOffices(officesData.offices);
    }
  }, [canInvite, t.loadFailed]);
  React.useEffect(() => { void load(); }, [load]);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setMessage(t.sending); const form = new FormData(event.currentTarget); const response = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) }); const data = await response.json().catch(() => null); if (!response.ok) { setMessage(data?.error || t.createFailed); return; } event.currentTarget.reset(); setMessage(t.invitationSent.replace("{id}", data.employeeNumber)); await load(); }
  return <section><p className="text-xs font-semibold uppercase tracking-[.18em] text-accent">{copy.accessManagementEyebrow}</p><h1 className="mt-2 font-serif text-3xl">{t.title}</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t.subtitle}</p>{canInvite ? <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card p-5"><h2 className="font-serif text-xl">{t.inviteTitle}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field name="fullName" label={t.fullName} /><Field name="email" label={t.workEmail} type="email" /><Field name="phone" label={t.phone} type="tel" /><label className="text-sm font-medium">{t.profile} <span className="text-accent">*</span><select className="input mt-2" name="role" required><option value="assessment">{t.roleAssessment}</option><option value="manager">{t.roleManager}</option><option value="regional_manager">{t.roleRegionalManager}</option></select></label></div><button className={`${buttonVariants({ variant: "primary", size: "md" })} mt-5`}>{t.invite}</button>{message ? <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p> : null}</form> : null}<div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground"><tr><th className="p-4">{t.headers.name}</th><th className="p-4">{t.headers.profile}</th><th className="p-4">{t.headers.employeeId}</th><th className="p-4">{t.headers.contact}</th><th className="p-4">{t.headers.status}</th><th className="p-4">{t.headers.actions}</th></tr></thead><tbody>{profiles.map(profile => <tr key={profile.id} className="border-b border-border last:border-0"><td className="p-4 font-medium">{profile.full_name}</td><td className="p-4">{roleLabel[profile.role] || profile.role}</td><td className="p-4 font-mono text-xs">{profile.employee_number}</td><td className="p-4"><p>{profile.email}</p><p className="text-muted-foreground">{profile.phone}</p></td><td className="p-4">{profile.active ? t.active : t.inactive}</td><td className="p-4"><div className="flex flex-col gap-1"><StatusActionButton active={!profile.active} activeLabel={copy.statusAction.reactivate} inactiveLabel={copy.statusAction.deactivate} failedLabel={copy.statusAction.actionFailed} onToggle={async () => { const response = await fetch(`/api/admin/team/${profile.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !profile.active }) }); if (response.ok) await load(); return response; }} />{canInvite ? <OfficeAssignSelect targetId={profile.id} kind="staff" currentOfficeId={profile.office_id} offices={offices} copy={copy.officeAssign} /> : null}</div></td></tr>)}</tbody></table>{!loading && !profiles.length ? <p className="p-8 text-center text-sm text-muted-foreground">{t.noProfilesYet}</p> : null}{loading ? <p className="p-8 text-center text-sm text-muted-foreground">{t.loadingProfiles}</p> : null}</div></section>;
}
function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) { return <label className="text-sm font-medium">{label} <span className="text-accent">*</span><input className="input mt-2" name={name} type={type} required /></label>; }
