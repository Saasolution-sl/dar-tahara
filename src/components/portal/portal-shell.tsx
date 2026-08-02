"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import type { PortalCopy } from "@/i18n/portal-copy";
import { AppLocaleSwitcher } from "@/components/layout/app-locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const routes = ["overview","properties","subscriptions","invoices","profile","support"] as const;
export function PortalShell({copy,email,locale,children}:{copy:PortalCopy;email:string;locale:Locale;children:ReactNode}){
  const pathname=usePathname();
  async function logout(){await fetch("/api/auth/logout",{method:"POST"});location.assign("/")}
  return <div className="min-h-screen bg-secondary/30"><header className="border-b border-border bg-background"><div className="container flex min-h-16 items-center justify-between gap-4"><Link href="/"><Logo variant="wordmark"/></Link><div className="flex items-center gap-3"><ThemeToggle/><AppLocaleSwitcher locale={locale} label={copy.language}/><span className="hidden text-sm text-muted-foreground sm:block">{email}</span><button onClick={logout} className="text-sm font-medium text-primary hover:underline">{copy.auth.logout}</button></div></div></header><div className="container grid gap-6 py-6 lg:grid-cols-[230px_1fr] lg:py-10"><aside><h1 className="font-serif text-2xl">{copy.dashboard.title}</h1><nav aria-label={copy.dashboard.title} className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:flex-col">{routes.map(key=>{const href=key==="overview"?"/account":`/account/${key}`;const active=pathname===href;return <Link key={key} href={href} className={cn("whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors",active?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-card hover:text-foreground")}>{copy.nav[key]}</Link>})}</nav></aside><main className="min-w-0">{children}</main></div></div>
}

export function PortalCard({title,children}:{title:string;children:ReactNode}){return <section className="rounded-2xl border border-border bg-card p-5 shadow-soft"><h2 className="font-serif text-xl text-foreground">{title}</h2><div className="mt-4">{children}</div></section>}
export function StatusBadge({value}:{value:string}){return <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{value.replaceAll("_"," ")}</span>}
