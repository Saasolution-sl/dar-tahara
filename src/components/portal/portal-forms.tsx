"use client";
import * as React from "react";import type { PortalCopy } from "@/i18n/portal-copy";import {buttonVariants} from "@/components/ui/button";import {cn} from "@/lib/utils";
export function ProposalAction({id,label,consentLabel,scheduleText,serviceWindowText,submittingLabel,successLabel,errorLabel}:{id:string;label:string;consentLabel:string;scheduleText:string;serviceWindowText:string;submittingLabel:string;successLabel:string;errorLabel:string}){
  const[busy,setBusy]=React.useState(false);
  const[authorized,setAuthorized]=React.useState(false);
  const[message,setMessage]=React.useState("");
  async function accept(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!authorized)return;
    setBusy(true);setMessage("");
    const r=await fetch(`/api/account/proposals/${id}/checkout`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({automaticPaymentAuthorized:true})});
    if(r.ok){setMessage(successLabel);location.reload();return}
    setMessage(errorLabel);setBusy(false);
  }
  return <form onSubmit={accept} className="w-full max-w-xl space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
    <p className="text-sm font-medium">{scheduleText}</p>
    <p className="text-xs leading-5 text-muted-foreground">{serviceWindowText}</p>
    <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-background p-3 text-sm leading-6">
      <input type="checkbox" required checked={authorized} onChange={e=>setAuthorized(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-primary"/>
      <span>{consentLabel}</span>
    </label>
    <button type="submit" disabled={busy||!authorized} className={buttonVariants({variant:"primary",size:"md"})}>{busy?submittingLabel:label}</button>
    {message?<p role="status" className="text-sm text-muted-foreground">{message}</p>:null}
  </form>
}
export function ProfileForm({copy,initial}:{copy:PortalCopy["dashboard"];initial:{first_name:string|null;last_name:string|null;phone:string;whatsapp_number:string|null;preferred_language:string}}){const[saved,setSaved]=React.useState(false);async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));const r=await fetch("/api/account/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});setSaved(r.ok)}return <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><input className="input" name="firstName" defaultValue={initial.first_name||""} autoComplete="given-name"/><input className="input" name="lastName" defaultValue={initial.last_name||""} autoComplete="family-name"/><input className="input" name="phone" defaultValue={initial.phone} autoComplete="tel"/><input className="input" name="whatsapp" defaultValue={initial.whatsapp_number||""} autoComplete="tel"/><button className={cn(buttonVariants({variant:"primary",size:"md"}),"sm:col-span-2")}>{saved?copy.saved:copy.save}</button></form>}
