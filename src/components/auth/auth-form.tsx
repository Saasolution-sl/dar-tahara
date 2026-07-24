"use client";

import * as React from "react";
import Link from "next/link";
import type { PortalCopy } from "@/i18n/portal-copy";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { establishPasswordSession } from "@/lib/supabase/password-session";

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
  const [saved,setSaved]=React.useState(false);
  const [busy,setBusy]=React.useState(false);
  const [error,setError]=React.useState<"short"|"session"|"weak"|"same"|"update"|null>(null);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setError(null);
    const data=new FormData(event.currentTarget);const password=data.get("password");
    if(typeof password!=="string"||password.length<12){setError("short");return}
    setBusy(true);
    try {
      const supabase=createClient();
      // Supabase invitation emails currently return an implicit-flow fragment,
      // while @supabase/ssr forces its browser client into PKCE mode. Establish
      // that fragment session explicitly before attempting the password update.
      const session=await establishPasswordSession(supabase.auth,window.location.hash);
      if(session.clearFragment){
        window.history.replaceState(window.history.state,"",`${window.location.pathname}${window.location.search}`);
      }
      if(!session.ok){setError("session");return}
      const response=await fetch("/api/auth/reset-password",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({password}),
      });
      const result=await response.json().catch(()=>({})) as {error?:string};
      if(!response.ok){
        if(result.error==="invalid_password"){setError("short");return}
        if(result.error==="invalid_session"){setError("session");return}
        if(result.error==="weak_password"){setError("weak");return}
        if(result.error==="same_password"){setError("same");return}
        setError("update");return
      }
      setSaved(true);
    } catch {
      setError("update");
    } finally {
      setBusy(false);
    }
  }
  if(saved)return <p className="mt-6 rounded-xl bg-primary/10 p-4 text-sm text-primary">{copy.passwordSaved} <Link href="/login" className="underline">{copy.login}</Link></p>;
  const errorMessage=error==="short"?copy.passwordTooShort:error==="session"?copy.resetLinkInvalid:error==="weak"?(copy.passwordWeak||copy.passwordUpdateFailed):error==="same"?(copy.passwordSame||copy.passwordUpdateFailed):error==="update"?copy.passwordUpdateFailed:null;
  return <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-medium">{copy.newPassword}<input name="password" type="password" autoComplete="new-password" minLength={12} required className="input mt-2" /></label>{errorMessage?<p role="alert" className="text-sm text-red-600">{errorMessage}</p>:null}<button disabled={busy} className={cn(buttonVariants({variant:"primary",size:"lg"}),"w-full")}>{copy.savePassword}</button></form>;
}
