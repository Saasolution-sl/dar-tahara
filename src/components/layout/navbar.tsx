"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
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
  const base = `/${locale}`;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: `${base}#${sections.why}`, label: dict.why },
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

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher locale={locale} label={dict.language} />
          <ThemeToggle label={dict.theme} />
          <Link
            href={`${base}#${sections.contact}`}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "ms-1")}
          >
            {dict.book}
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
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
            className="lg:hidden"
          >
            <div className="container flex flex-col gap-1 border-t border-border bg-background/95 pb-8 pt-4 backdrop-blur-xl">
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
                href={`${base}#${sections.contact}`}
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-3 w-full")}
              >
                {dict.book}
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
