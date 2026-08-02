"use client";
import*as React from"react";import{Search,RefreshCw}from"lucide-react";import{buttonVariants}from"@/components/ui/button";import type{AdminCopy}from"@/i18n/admin-copy";
type PauseRequest={id:string;status:string;reason_category:string;reason_description:string;requested_start_date:string;requested_end_date:string;approved_start_date:string|null;approved_end_date:string|null;customers:{full_name:string;email:string};subscriptions:{id:string;frequency:string;status:string;billed_price_cents:number;currency:string}};
export function PauseRequestsAdminClient({copy}:{copy:AdminCopy}){const c=copy.pauseRequests;const labels=c.statusLabels;const[rows,setRows]=React.useState<PauseRequest[]>([]);const[query,setQuery]=React.useState('');const[status,setStatus]=React.useState('all');const[busy,setBusy]=React.useState('');const[error,setError]=React.useState('');const load=React.useCallback(async()=>{const r=await fetch('/api/admin/pause-requests',{cache:'no-store'});if(!r.ok){setError(r.status===401?copy.common.notAuthorized:copy.common.dataUnavailable);return}setRows(await r.json());setError('')},[copy.common]);React.useEffect(()=>{load()},[load]);
  async function action(row:PauseRequest,name:string,extra:Record<string,unknown>={}){
    let notes='';
    if(['approve','reject','resume_early'].includes(name))notes=window.prompt(c.prompts.notes)||'';
    if(name==='approve'){
      const approvedStartDate=window.prompt(c.prompts.approvedStart,row.requested_start_date)||'';
      if(!approvedStartDate)return;
      const approvedEndDate=window.prompt(c.prompts.approvedEnd,row.requested_end_date)||'';
      if(!approvedEndDate)return;
      extra.approvedStartDate=approvedStartDate;extra.approvedEndDate=approvedEndDate;
    }
    setBusy(row.id);
    const r=await fetch('/api/admin/pause-requests/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:row.id,action:name,notes,...extra})});
    if(!r.ok)setError((await r.json()).error||copy.common.actionFailed);
    await load();setBusy('')
  }
  const visible=rows.filter(r=>(status==='all'||r.status===status)&&`${r.customers.full_name} ${r.customers.email} ${r.reason_category}`.toLowerCase().includes(query.toLowerCase()));
  return <div>
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-4xl">{c.title}</h1><p className="mt-1 text-sm text-muted-foreground">{rows.length} {c.subtitleSuffix}</p></div><button onClick={load} className={buttonVariants({variant:'outline',size:'md'})}><RefreshCw className="h-4 w-4"/>{copy.common.refresh}</button></header>
    {error?<p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-700">{error}</p>:null}
    <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_220px]"><label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={c.searchPlaceholder} className="input pl-10"/></label><select value={status} onChange={e=>setStatus(e.target.value)} className="input"><option value="all">{copy.common.allStatuses}</option>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
    <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">{c.columns.customer}</th><th className="p-4">{c.columns.reason}</th><th className="p-4">{c.columns.requested}</th><th className="p-4">{c.columns.approved}</th><th className="p-4">{c.columns.status}</th><th className="p-4">{c.columns.nextAction}</th></tr></thead><tbody className="divide-y divide-border">
      {visible.map(row=><tr key={row.id}>
        <td className="p-4"><p className="font-medium">{row.customers.full_name}</p><p className="text-xs text-muted-foreground">{row.customers.email}</p></td>
        <td className="p-4"><p>{row.reason_category.replaceAll('_',' ')}</p><p className="max-w-xs text-xs text-muted-foreground">{row.reason_description}</p></td>
        <td className="p-4">{row.requested_start_date} → {row.requested_end_date}</td>
        <td className="p-4">{row.approved_start_date?`${row.approved_start_date} → ${row.approved_end_date}`:'—'}</td>
        <td className="p-4"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{labels[row.status]||row.status}</span></td>
        <td className="p-4"><div className="flex flex-wrap gap-2">
          {row.status==='submitted'?<button disabled={busy===row.id} onClick={()=>action(row,'review')} className={buttonVariants({variant:'outline',size:'sm'})}>{c.actions.startReview}</button>:null}
          {['submitted','under_review'].includes(row.status)?<><button disabled={busy===row.id} onClick={()=>action(row,'approve')} className={buttonVariants({variant:'primary',size:'sm'})}>{c.actions.approve}</button><button disabled={busy===row.id} onClick={()=>action(row,'reject')} className={buttonVariants({variant:'outline',size:'sm'})}>{c.actions.reject}</button></>:null}
          {['approved','active'].includes(row.status)?<button disabled={busy===row.id} onClick={()=>action(row,'resume_early')} className={buttonVariants({variant:'outline',size:'sm'})}>{c.actions.resumeEarly}</button>:null}
        </div></td>
      </tr>)}
      {!visible.length?<tr><td colSpan={6} className="p-10 text-center text-muted-foreground">{c.noMatch}</td></tr>:null}
    </tbody></table></div>
  </div>
}
