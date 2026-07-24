"use client";

import * as React from "react";
import { BookOpenCheck, Globe2, RefreshCw, TriangleAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Question = {
  id: string;
  question: string;
  why_it_matters: string;
  current_knowledge: string;
  missing_information: string;
  suggested_answer_format: string;
  category: string;
  subcategory: string | null;
  priority: number;
  blocks_customer_support: boolean;
  status: string;
  owner_answer: string | null;
  normalized_detailed_answer: string | null;
};

type Dashboard = {
  questions: Question[];
  gaps: Array<{ id: string; normalized_question: string; occurrence_count: number; language: string; category: string; status: string }>;
  analytics: {
    unansweredQuestions: number;
    escalations: number;
    clarifications: number;
    selfServiceResolutions: number;
    lowConfidenceAnswers: number;
    repeatedRephrasedQuestions: number;
    customerAbandonments: number;
    awaitingOwnerAnswer: number;
    awaitingApproval: number;
    contradictoryEntries: number;
    outdatedEntries: number;
    categoryCoverage: Array<[string, number]>;
  };
};

type ContentDashboard = {
  suggestions: Array<{
    id: string; question: string; answer: string; source_url: string; source_page: string;
    language: string; extracted_text: string; status: string; occurrence_count: number;
  }>;
  sources: Array<{
    id: string; canonical_url: string; title: string; page_type: string; language: string;
    status: string; last_crawled_at: string | null; last_error: string | null;
  }>;
  analytics: {
    pendingSuggestions: number; approvedSuggestions: number; indexedPages: number; failedPages: number;
    feedbackScore: number | null; knowledgeCoverage: number; websiteChangesAwaitingReview: number;
    failedQuestions: number; topQuestions: Array<[string, number]>;
    mostVisitedPages: Array<[string, number]>; mostUsedArticles: Array<[string, number]>;
  };
};

export function KnowledgeBuilderClient() {
  const [data, setData] = React.useState<Dashboard | null>(null);
  const [contentData, setContentData] = React.useState<ContentDashboard | null>(null);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [answer, setAnswer] = React.useState("");
  const [status, setStatus] = React.useState("active");

  async function load() {
    setBusy(true);
    setError("");
    const [response, contentResponse] = await Promise.all([
      fetch("/api/admin/assistant/knowledge", { cache: "no-store" }),
      fetch("/api/admin/assistant/content", { cache: "no-store" }),
    ]);
    if (!response.ok) setError(response.status === 401 || response.status === 403 ? "Administrator access is required." : "Apply the Knowledge Builder migration and configure the Supabase service role.");
    else setData(await response.json() as Dashboard);
    if (contentResponse.ok) setContentData(await contentResponse.json() as ContentDashboard);
    setBusy(false);
  }

  React.useEffect(() => { void load(); }, []);

  async function update(question: Question, action: string) {
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/assistant/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: question.id, action, answer: action === "answer" ? answer : undefined }),
    });
    if (!response.ok) setError((await response.json() as { error?: string }).error || "Knowledge update failed.");
    else {
      setSelectedId(null);
      setAnswer("");
      await load();
    }
    setBusy(false);
  }

  async function updateContent(action: "sync" | "approve" | "reject", id?: string) {
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/assistant/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    if (!response.ok) setError((await response.json() as { error?: string }).error || "Knowledge engine action failed.");
    else await load();
    setBusy(false);
  }

  const visibleQuestions = (data?.questions || []).filter((question) => status === "all"
    || (status === "active" && !["approved", "rejected", "archived", "superseded"].includes(question.status))
    || question.status === status).slice(0, 10);
  const metrics = data?.analytics;

  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-accent"><BookOpenCheck className="h-4 w-4" /> Owner workflow</p>
          <h1 className="mt-2 font-serif text-4xl">Knowledge Builder</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Answer operational questions here. Customer conversations never see drafts; only separately approved answers become retrievable.</p>
        </div>
        <button onClick={load} disabled={busy} className={buttonVariants({ variant: "outline", size: "md" })}><RefreshCw className="h-4 w-4" /> Refresh</button>
      </header>
      {error ? <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-700">{error}</p> : null}
      {metrics ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Unanswered questions", metrics.unansweredQuestions],
            ["Awaiting owner", metrics.awaitingOwnerAnswer],
            ["Awaiting approval", metrics.awaitingApproval],
            ["Human escalations", metrics.escalations],
            ["Clarifications", metrics.clarifications],
            ["Self-service resolutions", metrics.selfServiceResolutions],
            ["Low-confidence answers", metrics.lowConfidenceAnswers],
            ["Repeated/rephrased gaps", metrics.repeatedRephrasedQuestions],
            ["Likely abandonments", metrics.customerAbandonments],
            ["Contradiction flags", metrics.contradictoryEntries],
            ["Outdated entries", metrics.outdatedEntries],
          ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-border bg-card p-4 shadow-soft"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>)}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="active">Next 10 active questions</option><option value="awaiting_owner_answer">Awaiting owner answer</option><option value="pending_approval">Pending approval</option><option value="approved">Approved</option><option value="all">All states</option>
        </select>
      </div>
      <div className="mt-5 space-y-4">
        {visibleQuestions.map((question) => (
          <article key={question.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-accent">{question.category}{question.subcategory ? ` · ${question.subcategory}` : ""}</p><h2 className="mt-2 font-serif text-2xl">{question.question}</h2></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{question.status}</span></div>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div><dt className="font-semibold">Why it matters</dt><dd className="mt-1 text-muted-foreground">{question.why_it_matters}</dd></div>
              <div><dt className="font-semibold">Current approved knowledge</dt><dd className="mt-1 text-muted-foreground">{question.current_knowledge}</dd></div>
              <div><dt className="font-semibold">Still missing</dt><dd className="mt-1 text-muted-foreground">{question.missing_information}</dd></div>
              <div><dt className="font-semibold">Suggested answer format</dt><dd className="mt-1 whitespace-pre-line text-muted-foreground">{question.suggested_answer_format}</dd></div>
            </dl>
            {question.blocks_customer_support ? <p className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-700"><TriangleAlert className="h-4 w-4" /> This gap blocks a reliable customer answer.</p> : null}
            {selectedId === question.id ? <div className="mt-4"><textarea rows={8} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={question.suggested_answer_format} className="input h-auto w-full py-3" /><div className="mt-3 flex gap-2"><button disabled={busy || answer.trim().length < 3} onClick={() => update(question, "answer")} className={buttonVariants({ variant: "primary", size: "sm" })}>Save for approval</button><button onClick={() => setSelectedId(null)} className={buttonVariants({ variant: "ghost", size: "sm" })}>Cancel</button></div></div> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {["awaiting_owner_answer", "needs_clarification", "draft_question"].includes(question.status) ? <button onClick={() => { setSelectedId(question.id); setAnswer(question.owner_answer || ""); }} className={buttonVariants({ variant: "primary", size: "sm" })}>Answer question</button> : null}
              {question.status === "pending_approval" ? <><button disabled={busy} onClick={() => update(question, "approve")} className={buttonVariants({ variant: "primary", size: "sm" })}>Approve and publish</button><button disabled={busy} onClick={() => update(question, "needs_clarification")} className={buttonVariants({ variant: "outline", size: "sm" })}>Needs clarification</button><button disabled={busy} onClick={() => update(question, "reject")} className={buttonVariants({ variant: "ghost", size: "sm" })}>Reject</button></> : null}
            </div>
            {question.normalized_detailed_answer ? <div className="mt-4 rounded-xl bg-secondary/50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proposed normalized answer</p><p className="mt-2 whitespace-pre-line text-sm">{question.normalized_detailed_answer}</p></div> : null}
          </article>
        ))}
      </div>
      {(data?.gaps || []).length ? <section className="mt-10"><h2 className="font-serif text-3xl">Most common unanswered questions</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{data!.gaps.slice(0, 10).map((gap) => <div key={gap.id} className="rounded-xl border border-border bg-card p-4"><p className="text-sm font-medium">{gap.normalized_question}</p><p className="mt-2 text-xs text-muted-foreground">Asked {gap.occurrence_count}× · {gap.language} · {gap.category} · {gap.status}</p></div>)}</div></section> : null}
      {contentData ? <WebsiteKnowledgeEngine data={contentData} busy={busy} onAction={updateContent} /> : null}
    </section>
  );
}

function WebsiteKnowledgeEngine({
  data,
  busy,
  onAction,
}: {
  data: ContentDashboard;
  busy: boolean;
  onAction: (action: "sync" | "approve" | "reject", id?: string) => Promise<void>;
}) {
  const pending = data.suggestions.filter((item) => item.status === "pending_review").slice(0, 20);
  return (
    <section className="mt-12 border-t border-border pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-accent"><Globe2 className="h-4 w-4" /> Official website</p>
          <h2 className="mt-2 font-serif text-3xl">Website knowledge engine</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">The crawler can ground answers in public Dar Tahara pages. Suggested knowledge remains private until an administrator publishes it.</p>
        </div>
        <button disabled={busy} onClick={() => onAction("sync")} className={buttonVariants({ variant: "outline", size: "md" })}><RefreshCw className="h-4 w-4" /> Sync website now</button>
      </header>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Pending suggestions", data.analytics.pendingSuggestions],
          ["Indexed pages", data.analytics.indexedPages],
          ["Website changes", data.analytics.websiteChangesAwaitingReview],
          ["Failed pages", data.analytics.failedPages],
          ["Failed questions", data.analytics.failedQuestions],
          ["Feedback score", data.analytics.feedbackScore == null ? "—" : `${data.analytics.feedbackScore}%`],
          ["Knowledge coverage", `${data.analytics.knowledgeCoverage}%`],
        ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-border bg-card p-4 shadow-soft"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>)}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          ["Top questions", data.analytics.topQuestions],
          ["Most visited pages", data.analytics.mostVisitedPages],
          ["Most used articles", data.analytics.mostUsedArticles],
        ].map(([title, rows]) => (
          <div key={String(title)} className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-semibold">{title as string}</h3>
            <ol className="mt-3 space-y-2 text-sm">
              {(rows as Array<[string, number]>).map(([label, count]) => <li key={label} className="flex items-center justify-between gap-3"><span className="truncate text-muted-foreground">{label}</span><span className="font-medium">{count}</span></li>)}
            </ol>
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        <h3 className="font-serif text-2xl">Website approval queue</h3>
        {pending.map((suggestion) => (
          <article key={suggestion.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-accent">{suggestion.language} · asked {suggestion.occurrence_count}×</p><h4 className="mt-2 font-serif text-2xl">{suggestion.question}</h4></div>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700">{suggestion.status}</span>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm">{suggestion.answer}</p>
            <div className="mt-4 rounded-xl bg-secondary/50 p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">{suggestion.source_page}</p>
              <a href={suggestion.source_url} target="_blank" rel="noreferrer" className="mt-1 block break-all underline">{suggestion.source_url}</a>
              <p className="mt-2 line-clamp-4 whitespace-pre-line">{suggestion.extracted_text}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={busy} onClick={() => onAction("approve", suggestion.id)} className={buttonVariants({ variant: "primary", size: "sm" })}>Approve and publish</button>
              <button disabled={busy} onClick={() => onAction("reject", suggestion.id)} className={buttonVariants({ variant: "ghost", size: "sm" })}>Reject</button>
            </div>
          </article>
        ))}
        {!pending.length ? <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">No website suggestions are waiting for review.</p> : null}
      </div>
      <div className="mt-8">
        <h3 className="font-serif text-2xl">Indexed pages</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {data.sources.slice(0, 20).map((source) => <div key={source.id} className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium">{source.title || source.canonical_url}</p><span className="text-xs text-muted-foreground">{source.status}</span></div><p className="mt-1 break-all text-xs text-muted-foreground">{source.canonical_url}</p>{source.last_error ? <p className="mt-2 text-xs text-red-700">{source.last_error}</p> : null}</div>)}
        </div>
      </div>
    </section>
  );
}
