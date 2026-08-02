"use client";

import * as React from "react";
import Link from "next/link";
import type { PortalCopy } from "@/i18n/portal-copy";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { establishPasswordSession } from "@/lib/supabase/password-session";
import { buildAuthCallbackUrl, type AuthEntryPoint } from "@/lib/auth-redirect";
import type { Locale } from "@/i18n/config";

type SocialProvider = "google" | "apple";

// Provider buttons stay hidden until the matching Supabase provider has been
// configured and verified for the current deployment environment.
const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
const appleAuthEnabled = process.env.NEXT_PUBLIC_APPLE_AUTH_ENABLED === "true";
const socialAuthEnabled = googleAuthEnabled || appleAuthEnabled;

function GoogleIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.7A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.3L6.5 14Z"/><path fill="#EA4335" d="M12 6c1.6 0 3 .5 4.1 1.6l3.1-3A10.3 10.3 0 0 0 3.1 7.3L6.5 10A5.9 5.9 0 0 1 12 6Z"/></svg>;
}

function AppleIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.1 12.5c0-2.5 2.1-3.7 2.2-3.8a4.8 4.8 0 0 0-3.8-2.1c-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9a4.9 4.9 0 0 0-4.1 2.5c-1.8 3-.5 7.5 1.2 10 .8 1.2 1.8 2.5 3.1 2.4 1.2 0 1.7-.8 3.3-.8 1.5 0 2 .8 3.3.8 1.4 0 2.3-1.2 3.1-2.4a10.7 10.7 0 0 0 1.4-2.9 4.3 4.3 0 0 1-2.5-3.7ZM14.5 4.9A4.3 4.3 0 0 0 15.5 2a4.4 4.4 0 0 0-2.8 1.4 4 4 0 0 0-1.1 2.8 3.7 3.7 0 0 0 2.9-1.3Z"/></svg>;
}

function SocialAuthButtons({ copy, next, from, oauthError = false }: { copy: PortalCopy["auth"]; next: string; from: AuthEntryPoint; oauthError?: boolean }) {
  const [busyProvider, setBusyProvider] = React.useState<SocialProvider | null>(null);
  const [error, setError] = React.useState(oauthError);

  async function continueWith(provider: SocialProvider) {
    setBusyProvider(provider);
    setError(false);
    try {
      const { error: oauthError } = await createClient().auth.signInWithOAuth({
        provider,
        options: { redirectTo: buildAuthCallbackUrl(window.location.origin, next, from) },
      });
      if (oauthError) throw oauthError;
    } catch {
      setBusyProvider(null);
      setError(true);
    }
  }

  return <div>
    <div className="grid gap-3">
      {googleAuthEnabled ? <button type="button" disabled={busyProvider !== null} onClick={() => continueWith("google")} className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-secondary/50 disabled:cursor-wait disabled:opacity-60"><GoogleIcon />{busyProvider === "google" ? copy.redirecting : copy.continueGoogle}</button> : null}
      {appleAuthEnabled ? <button type="button" disabled={busyProvider !== null} onClick={() => continueWith("apple")} className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"><AppleIcon />{busyProvider === "apple" ? copy.redirecting : copy.continueApple}</button> : null}
    </div>
    {error ? <p role="alert" className="mt-3 text-sm text-red-600">{copy.oauthFailed}</p> : null}
  </div>;
}

function AuthDivider({ label }: { label: string }) {
  return <div className="my-6 flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-border"/><span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</span><span className="h-px flex-1 bg-border"/></div>;
}

export function LoginForm({ copy, next, oauthError = false, suspendedError = false }: { copy: PortalCopy["auth"]; next: string; oauthError?: boolean; suspendedError?: boolean }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(suspendedError);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(false);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email:data.get("email"), password:data.get("password"), next }) });
    const result = await response.json().catch(() => ({})) as { destination?: string };
    if (response.ok && result.destination) { location.assign(result.destination); return; }
    setBusy(false); setError(true);
  }
  return <div className="mt-7">
    {socialAuthEnabled ? <><SocialAuthButtons copy={copy} next={next} from="login" oauthError={oauthError} /><AuthDivider label={copy.orEmail} /></> : null}
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-medium">{copy.email}<input name="email" type="email" autoComplete="email" required className="input mt-2" /></label>
      <label className="block text-sm font-medium">{copy.password}<input name="password" type="password" autoComplete="current-password" required minLength={8} className="input mt-2" /></label>
      {error ? <p role="alert" className="text-sm text-red-600">{copy.invalid}</p> : null}
      <button disabled={busy} className={cn(buttonVariants({variant:"primary",size:"lg"}),"w-full")}>{busy ? copy.signingIn : copy.signIn}</button>
      <Link href="/forgot-password" className="block text-center text-sm text-primary underline-offset-4 hover:underline">{copy.forgot}</Link>
    </form>
    <p className="mt-6 text-center text-sm text-muted-foreground">{copy.noAccount} <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-primary underline-offset-4 hover:underline">{copy.createAccount}</Link></p>
  </div>;
}

export function SignupForm({ copy, next, locale, oauthError = false }: { copy: PortalCopy["auth"]; next: string; locale: Locale; oauthError?: boolean }) {
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<"short" | "weak" | "failed" | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password"), accountType: data.get("accountType"), next }) });
    const result = await response.json().catch(() => ({})) as { destination?: string; error?: string };
    if (response.ok && result.destination) { location.assign(result.destination); return; }
    if (response.ok) { setSent(true); setBusy(false); return; }
    setError(result.error === "password_too_short" ? "short" : result.error === "weak_password" ? "weak" : "failed");
    setBusy(false);
  }

  if (sent) return <div className="mt-7 rounded-2xl bg-primary/10 p-5"><p className="font-semibold text-primary">{copy.checkEmailTitle}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.checkEmail}</p><Link href="/login" className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">{copy.backToLogin}</Link></div>;

  return <div className="mt-7">
    {socialAuthEnabled ? <><SocialAuthButtons copy={copy} next={next} from="signup" oauthError={oauthError} /><AuthDivider label={copy.orEmail} /></> : null}
    <form onSubmit={submit} className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium">{locale === "nl" ? "Accounttype" : "Account type"}</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <label className="rounded-xl border border-border p-3 text-sm">
            <input type="radio" name="accountType" value="personal" defaultChecked className="mr-2 accent-primary" />
            {locale === "nl" ? "Particuliere klant" : "Personal customer"}
          </label>
          <label className="rounded-xl border border-border p-3 text-sm">
            <input type="radio" name="accountType" value="company" className="mr-2 accent-primary" />
            {locale === "nl" ? "Zakelijke klant" : "Company customer"}
          </label>
        </div>
      </fieldset>
      <label className="block text-sm font-medium">{copy.email}<input name="email" type="email" autoComplete="email" required className="input mt-2" /></label>
      <label className="block text-sm font-medium">{copy.password}<input name="password" type="password" autoComplete="new-password" required minLength={12} aria-describedby="password-help" className="input mt-2" /></label>
      <p id="password-help" className="text-xs text-muted-foreground">{copy.passwordHint}</p>
      {error ? <p role="alert" className="text-sm text-red-600">{error === "short" ? copy.passwordTooShort : error === "weak" ? (copy.passwordWeak || copy.signupFailed) : copy.signupFailed}</p> : null}
      <button disabled={busy} className={cn(buttonVariants({variant:"primary",size:"lg"}),"w-full")}>{busy ? copy.creatingAccount : copy.createAccount}</button>
    </form>
    <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">{copy.agreement} <Link href={`/${locale}/terms`} className="underline underline-offset-2">{copy.terms}</Link> {copy.and} <Link href={`/${locale}/privacy`} className="underline underline-offset-2">{copy.privacy}</Link>.</p>
    <p className="mt-6 text-center text-sm text-muted-foreground">{copy.haveAccount} <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-primary underline-offset-4 hover:underline">{copy.signIn}</Link></p>
  </div>;
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
