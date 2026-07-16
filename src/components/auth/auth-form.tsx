"use client";

import * as React from "react";
import Link from "next/link";
import type { PortalCopy } from "@/i18n/portal-copy";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ copy, next }: { copy: PortalCopy["auth"]; next: string }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(false);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email:data.get("email"), password:data.get("password"), next }) });
    const result = await response.json().catch(() => ({})) as { destination?: string };
    if (response.ok && result.destination) { location.assign(result.destination); return; }
    setBusy(false); setError(true);
  }
  return <form onSubmit={submit} className="mt-7 space-y-4">
    <label className="block text-sm font-medium">{copy.email}<input name="email" type="email" autoComplete="email" required className="input mt-2" /></label>
    <label className="block text-sm font-medium">{copy.password}<input name="password" type="password" autoComplete="current-password" required minLength={8} className="input mt-2" /></label>
    {error ? <p role="alert" className="text-sm text-red-600">{copy.invalid}</p> : null}
    <button disabled={busy} className={cn(buttonVariants({variant:"primary",size:"lg"}),"w-full")}>{busy ? copy.signingIn : copy.signIn}</button>
    <Link href="/forgot-password" className="block text-center text-sm text-primary underline-offset-4 hover:underline">{copy.forgot}</Link>
  </form>;
}

export function ResetRequestForm({ copy }: { copy: PortalCopy["auth"] }) {
  const [sent, setSent] = React.useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    await fetch("/api/auth/forgot-password", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:data.get("email")})});
    setSent(true);
  }
  return sent ? <p className="mt-6 rounded-xl bg-primary/10 p-4 text-sm text-primary">{copy.resetSent}</p> : <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-medium">{copy.email}<input name="email" type="email" autoComplete="email" required className="input mt-2" /></label><button className={cn(buttonVariants({variant:"primary",size:"lg"}),"w-full")}>{copy.sendReset}</button></form>;
}

export function NewPasswordForm({ copy }: { copy: PortalCopy["auth"] }) {
  const [saved,setSaved]=React.useState(false); const [error,setError]=React.useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setError(false);
    const data=new FormData(event.currentTarget);const password=data.get("password");
    if(typeof password!=="string"||password.length<12){setError(true);return}
    // Initializing the browser client consumes invite/recovery credentials from
    // the URL, persists the resulting session in secure SSR cookies, and lets
    // the user choose their password without exposing a temporary credential.
    const supabase=createClient();const {data:session}=await supabase.auth.getSession();
    if(!session.session){setError(true);return}
    const {error:updateError}=await supabase.auth.updateUser({password});
    setSaved(!updateError);setError(Boolean(updateError));
  }
  if(saved)return <p className="mt-6 rounded-xl bg-primary/10 p-4 text-sm text-primary">{copy.passwordSaved} <Link href="/login" className="underline">{copy.login}</Link></p>;
  return <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-medium">{copy.newPassword}<input name="password" type="password" autoComplete="new-password" minLength={12} required className="input mt-2" /></label>{error?<p role="alert" className="text-sm text-red-600">{copy.invalid}</p>:null}<button className={cn(buttonVariants({variant:"primary",size:"lg"}),"w-full")}>{copy.savePassword}</button></form>;
}
