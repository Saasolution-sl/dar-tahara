"use client";
import*as React from"react";import{Search,RefreshCw}from"lucide-react";import{buttonVariants}from"@/components/ui/button";import type{AdminCopy}from"@/i18n/admin-copy";
type DeepCleanRequest={id:string;status:string;requested_date:string;is_free:boolean;price_cents:number;currency:string;payment_status:string;customers:{full_name:string;email:string};subscriptions:{id:string;frequency:string;status:string}};
function money(cents:number,currency:string){return new Intl.NumberFormat("en",{style:"currency",currency:currency.toUpperCase()}).format(cents/100)}
export function DeepCleanRequestsAdminClient({copy}:{copy:AdminCopy}){const c=copy.deepCleanRequests;const labels=c.statusLabels;const[rows,setRows]=React.useState<DeepCleanRequest[]>([]);const[query,setQuery]=React.useState('');const[status,setStatus]=React.useState('all');const[busy,setBusy]=React.useState('');const[error,setError]=React.useState('');const load=React.useCallback(async()=>{const r=await fetch('/api/admin/deep-clean-requests',{cache:'no-store'});if(!r.ok){setError(r.status===401?copy.common.notAuthorized:copy.common.dataUnavailable);return}setRows(await r.json());setError('')},[copy.common]);React.useEffect(()=>{load()},[load]);
  async function action(row:DeepCleanRequest,name:string){
    let notes='';
    if(['approve','reject'].includes(name))notes=window.prompt(c.prompts.notes)||'';
    setBusy(row.id);
    const r=await fetch('/api/admin/deep-clean-requests/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:row.id,action:name,notes})});
    if(!r.ok)setError((await r.json()).error||copy.common.actionFailed);
    await load();setBusy('')
  }
  const visible=rows.filter(r=>(status==='all'||r.status===status)&&`${r.customers.full_name} ${r.customers.email}`.toLowerCase().includes(query.toLowerCase()));
  return <div>
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-4xl">{c.title}</h1><p className="mt-1 text-sm text-muted-foreground">{rows.length} {c.subtitleSuffix}</p></div><button onClick={load} className={buttonVariants({variant:'outline',size:'md'})}><RefreshCw className="h-4 w-4"/>{copy.common.refresh}</button></header>
    {error?<p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-700">{error}</p>:null}
    <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_220px]"><label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={c.searchPlaceholder} className="input pl-10"/></label><select value={status} onChange={e=>setStatus(e.target.value)} className="input"><option value="all">{copy.common.allStatuses}</option>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
    <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">{c.columns.customer}</th><th className="p-4">{c.columns.date}</th><th className="p-4">{c.columns.price}</th><th className="p-4">{c.columns.status}</th><th className="p-4">{c.columns.nextAction}</th></tr></thead><tbody className="divide-y divide-border">
      {visible.map(row=><tr key={row.id}>
        <td className="p-4"><p className="font-medium">{row.customers.full_name}</p><p className="text-xs text-muted-foreground">{row.customers.email}</p></td>
        <td className="p-4">{row.requested_date}</td>
        <td className="p-4">{row.is_free?c.freeLabel:money(row.price_cents,row.currency)}{!row.is_free?<p className="text-xs text-muted-foreground">{row.payment_status}</p>:null}</td>
        <td className="p-4"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{labels[row.status]||row.status}</span></td>
        <td className="p-4"><div className="flex flex-wrap gap-2">
          {row.status==='submitted'?<button disabled={busy===row.id} onClick={()=>action(row,'review')} className={buttonVariants({variant:'outline',size:'sm'})}>{c.actions.startReview}</button>:null}
          {['submitted','under_review'].includes(row.status)?<><button disabled={busy===row.id||(!row.is_free&&row.payment_status!=='paid')} onClick={()=>action(row,'approve')} className={buttonVariants({variant:'primary',size:'sm'})}>{c.actions.approve}</button><button disabled={busy===row.id} onClick={()=>action(row,'reject')} className={buttonVariants({variant:'outline',size:'sm'})}>{c.actions.reject}</button></>:null}
          {row.status==='scheduled'?<button disabled={busy===row.id} onClick={()=>action(row,'complete')} className={buttonVariants({variant:'outline',size:'sm'})}>{c.actions.complete}</button>:null}
        </div></td>
      </tr>)}
      {!visible.length?<tr><td colSpan={5} className="p-10 text-center text-muted-foreground">{c.noMatch}</td></tr>:null}
    </tbody></table></div>
  </div>
}
