"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections, pages } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";

export function Navbar({
  locale,
  dict,
  whatsappHref,
}: {
  locale: Locale;
  dict: Dictionary["nav"];
  whatsappHref: string;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [accountHref, setAccountHref] = React.useState("/login");
  const [authenticated, setAuthenticated] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const aboutRef = React.useRef<HTMLLIElement>(null);
  const aboutButtonRef = React.useRef<HTMLButtonElement>(null);
  const base = `/${locale}`;

  // Close the About menu on outside pointer input.
  React.useEffect(() => {
    if (!aboutOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!aboutRef.current?.contains(event.target as Node)) setAboutOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [aboutOpen]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((value: { authenticated?: boolean; destination?: string }) => {
        if (value.authenticated && value.destination) {
          setAuthenticated(true);
          setAccountHref(value.destination);
        }
      })
      .catch(() => undefined);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // "Why Dar Tahara" now lives inside the About menu, so the top-level row
  // keeps the same width in long-label locales (nl/de) instead of overflowing.
  const aboutLinks = [
    { href: `${base}${pages.missionVision}`, label: dict.missionVision },
    { href: `${base}${pages.peopleCommunity}`, label: dict.peopleCommunity },
    { href: `${base}${pages.serviceAreas}`, label: dict.serviceAreas },
    { href: `${base}#${sections.why}`, label: dict.why },
  ];

  const links = [
    { href: `${base}#${sections.services}`, label: dict.services },
    { href: `${base}#${sections.plans}`, label: dict.plans },
    { href: `${base}#${sections.calculator}`, label: dict.pricing },
    { href: `${base}#${sections.how}`, label: dict.how },
    { href: `${base}#${sections.gallery}`, label: dict.gallery },
    { href: `${base}#${sections.faq}`, label: dict.faq },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxe",
        scrolled
          ? "border-b border-border/70 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href={base} aria-label="Dar Tahara home" className="shrink-0">
          <Logo variant="wordmark" />
        </Link>

        <ul className="hidden items-center gap-0.5 xl:flex">
          <li
            ref={aboutRef}
            className="relative"
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && aboutOpen) {
                setAboutOpen(false);
                aboutButtonRef.current?.focus();
              }
            }}
          >
            <button
              ref={aboutButtonRef}
              type="button"
              aria-expanded={aboutOpen}
              aria-haspopup="true"
              aria-controls="nav-about-menu"
              onClick={() => setAboutOpen((v) => !v)}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {dict.about}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-300 ease-luxe",
                  aboutOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            <AnimatePresence>
              {aboutOpen ? (
                <motion.div
                  id="nav-about-menu"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute start-0 top-full z-50 min-w-56 pt-2"
                >
                  <div className="overflow-hidden rounded-2xl border border-border bg-background/95 p-1.5 shadow-lift backdrop-blur-xl">
                    {aboutLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setAboutOpen(false)}
                        className="block whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>

          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 xl:flex">
          <LanguageSwitcher locale={locale} label={dict.language} />
          <ThemeToggle label={dict.theme} />
          <Link
            href={accountHref}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "ms-1")}
          >
            {authenticated ? dict.myAccount : dict.login}
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 xl:hidden">
          <ThemeToggle label={dict.theme} />
          <button
            type="button"
            aria-label={open ? dict.close : dict.menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="xl:hidden"
          >
            <div className="container flex flex-col gap-1 border-t border-border bg-background/95 pb-8 pt-4 backdrop-blur-xl">
              <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                {dict.about}
              </p>
              {aboutLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base text-foreground transition-colors hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" aria-hidden />
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base text-foreground transition-colors hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 flex items-center justify-between px-1">
                <LanguageSwitcher locale={locale} label={dict.language} />
              </div>
              <Link
                href={accountHref}
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-3 w-full")}
              >
                {authenticated ? dict.myAccount : dict.login}
              </Link>
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-2 w-full")}
              >
                WhatsApp
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
