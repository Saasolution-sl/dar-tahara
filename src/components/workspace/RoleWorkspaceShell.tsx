"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppLocaleSwitcher } from "@/components/layout/app-locale-switcher";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function RoleWorkspaceShell({
  title,
  email,
  links,
  children,
  locale,
  signOutLabel = "Sign out",
  languageLabel = "Language",
}: {
  title: string;
  email: string;
  links: Array<{ href: string; label: string }>;
  children: ReactNode;
  locale: Locale;
  signOutLabel?: string;
  languageLabel?: string;
}) {
  const pathname = usePathname();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.assign("/login");
  }
  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background">
        <div className="container flex min-h-16 items-center justify-between gap-4">
          <Link href="/"><Logo variant="wordmark" /></Link>
          <div className="flex items-center gap-3">
            <AppLocaleSwitcher locale={locale} label={languageLabel} />
            <ThemeToggle />
            <span className="hidden text-sm text-muted-foreground sm:block">{email}</span>
            <button onClick={logout} className="text-sm font-medium text-primary hover:underline">{signOutLabel}</button>
          </div>
        </div>
      </header>
      <div className="container grid gap-6 py-6 lg:grid-cols-[230px_1fr] lg:py-10">
        <aside>
          <h1 className="font-serif text-2xl">{title}</h1>
          <nav className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:flex-col" aria-label={title}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={cn("whitespace-nowrap rounded-xl px-3 py-2 text-sm", pathname === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card hover:text-foreground")}>{link.label}</Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
