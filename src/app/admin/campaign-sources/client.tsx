"use client";

import * as React from "react";
import { ShieldCheck, LogOut, Copy, Check, QrCode, Plus, Link2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SOURCE_CHANNELS } from "@/lib/campaign-sources";
import { cn } from "@/lib/utils";

/**
 * Minimal admin utility (brief §28) to create + label trackable distribution
 * links and generate QR codes, backed by campaign_sources. Deliberately small —
 * it does not reproduce Mautic's contacts, campaigns, segments or analytics.
 */

type Source = {
  id: string;
  internal_name: string;
  source_code: string;
  source_channel: string | null;
  status: string;
  created_at: string;
  tracked_url: string;
};

const EMPTY = {
  internalName: "", sourceCode: "", sourceChannel: "whatsapp", sourceType: "",
  responsiblePerson: "", partnerName: "", city: "", targetAudience: "",
  utmMedium: "", utmContent: "", campaignCost: "", notes: "",
};

export function CampaignSourcesClient() {
  const [token, setToken] = React.useState("");
  const [ready, setReady] = React.useState(false);
  const [sources, setSources] = React.useState<Source[]>([]);
  const [form, setForm] = React.useState<Record<string, string>>({ ...EMPTY });
  const [error, setError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [qr, setQr] = React.useState<Source | null>(null);

  const load = React.useCallback(async () => {
    const r = await fetch("/api/admin/campaign-sources", { cache: "no-store" });
    if (r.status === 401) { setReady(false); return; }
    if (!r.ok) { setError("Not configured."); return; }
    const d = await r.json();
    setSources(d.sources ?? []);
    setReady(true);
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin/auth", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) { setError(r.status === 503 ? "Admin not configured." : "Invalid token."); return; }
    setToken("");
    load();
  }

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setFieldErrors({});
    const r = await fetch("/api/admin/campaign-sources", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, campaignCost: form.campaignCost || null }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok && d.ok) { setForm({ ...EMPTY }); await load(); return; }
    if (d.fields) setFieldErrors(d.fields);
    setError(d.error === "duplicate_code" ? "That source code already exists." : d.error === "validation_failed" ? "Please check the highlighted fields." : "Could not create.");
  }

  async function copy(url: string, id: string) {
    try { await navigator.clipboard.writeText(url); setCopied(id); setTimeout(() => setCopied(null), 1600); } catch { /* */ }
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary/30 p-6">
        <form onSubmit={login} className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-lift">
          <ShieldCheck className="h-10 w-10 text-primary" />
          <h1 className="mt-5 text-3xl">Campaign Links</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter the private admin API token. Access expires after eight hours.</p>
          <label className="mt-6 block text-sm font-medium">Access token
            <input type="password" autoFocus value={token} onChange={(e) => setToken(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" />
          </label>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-6 w-full")}>Open</button>
        </form>
      </main>
    );
  }

  const input = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";
  const fe = (k: string) => fieldErrors[k] ? <span className="text-xs text-red-600"> — {fieldErrors[k]}</span> : null;

  return (
    <main className="min-h-screen bg-secondary/30 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">Private operations</p>
            <h1 className="mt-2 text-4xl">Campaign Links</h1>
            <p className="mt-1 text-sm text-muted-foreground">{sources.length} sources · generate trackable early-access links + QR</p>
          </div>
          <button onClick={async () => { await fetch("/api/admin/auth", { method: "DELETE" }); setReady(false); }}
            className={buttonVariants({ variant: "ghost", size: "md" })}><LogOut className="h-4 w-4" />Sign out</button>
        </header>

        {/* Create form */}
        <form onSubmit={create} className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Plus className="h-4 w-4 text-primary" />New source</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm">Internal name{fe("internalName")}
              <input className={input} value={form.internalName} onChange={(e) => set("internalName", e.target.value)} placeholder="Tangier owners WhatsApp group" /></label>
            <label className="text-sm">Source code{fe("sourceCode")}
              <input className={input} value={form.sourceCode} onChange={(e) => set("sourceCode", e.target.value)} placeholder="wa_tng_001" /></label>
            <label className="text-sm">Channel{fe("sourceChannel")}
              <select className={input} value={form.sourceChannel} onChange={(e) => set("sourceChannel", e.target.value)}>
                {SOURCE_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select></label>
            <label className="text-sm">Responsible person
              <input className={input} value={form.responsiblePerson} onChange={(e) => set("responsiblePerson", e.target.value)} /></label>
            <label className="text-sm">Partner / influencer
              <input className={input} value={form.partnerName} onChange={(e) => set("partnerName", e.target.value)} /></label>
            <label className="text-sm">City
              <input className={input} value={form.city} onChange={(e) => set("city", e.target.value)} /></label>
            <label className="text-sm">UTM medium
              <input className={input} value={form.utmMedium} onChange={(e) => set("utmMedium", e.target.value)} placeholder="group" /></label>
            <label className="text-sm">UTM content
              <input className={input} value={form.utmContent} onChange={(e) => set("utmContent", e.target.value)} placeholder="tangier_owners" /></label>
            <label className="text-sm">Cost {fe("campaignCost")}
              <input className={input} type="number" min={0} step="0.01" value={form.campaignCost} onChange={(e) => set("campaignCost", e.target.value)} /></label>
            <label className="text-sm sm:col-span-2 lg:col-span-3">Target audience / notes
              <input className={input} value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} /></label>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button disabled={busy} className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-4")}>
            {busy ? "Creating…" : "Create source + link"}
          </button>
        </form>

        {/* List */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Channel</th><th className="px-4 py-3">Tracked link</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody>
              {sources.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No sources yet — create one above.</td></tr>
              ) : sources.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="px-4 py-3 font-medium">{s.internal_name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.source_code}</td>
                  <td className="px-4 py-3">{s.source_channel ?? "—"}</td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-xs text-muted-foreground" title={s.tracked_url}>
                    <Link2 className="mr-1 inline h-3 w-3" />{s.tracked_url.replace(/^https:\/\//, "")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => copy(s.tracked_url, s.id)} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-xs hover:bg-secondary/70">
                        {copied === s.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}{copied === s.id ? "Copied" : "Copy"}
                      </button>
                      <button onClick={() => setQr(s)} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-xs hover:bg-secondary/70">
                        <QrCode className="h-3.5 w-3.5" />QR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR modal */}
      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setQr(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-lift" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">{qr.internal_name}</h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{qr.source_code}</p>
            <img alt="QR code" className="mx-auto mt-4 h-64 w-64" src={`/api/admin/campaign-sources/qr?url=${encodeURIComponent(qr.tracked_url)}`} />
            <div className="mt-4 flex justify-center gap-2">
              <a href={`/api/admin/campaign-sources/qr?download=1&url=${encodeURIComponent(qr.tracked_url)}`}
                download="dar-tahara-qr.svg" className={buttonVariants({ variant: "primary", size: "sm" })}>Download SVG</a>
              <button onClick={() => setQr(null)} className={buttonVariants({ variant: "ghost", size: "sm" })}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
