import * as React from "react";
import Link from "next/link";
import { Mail, Phone, MessageCircle, Instagram, Facebook, Linkedin } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site, whatsappLink, sections } from "@/lib/site";
import { Logo } from "@/components/brand/logo";
import { SubscribeForm } from "@/components/mailing-list/subscribe-form";
import { cn } from "@/lib/utils";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const base = `/${locale}`;
  const f = dict.footer;

  const explore = [
    { href: `${base}#${sections.why}`, label: dict.nav.why },
    { href: `${base}#${sections.plans}`, label: dict.nav.plans },
    { href: `${base}#${sections.how}`, label: dict.nav.how },
    { href: `${base}#${sections.faq}`, label: dict.nav.faq },
  ];

  const serviceLinks = dict.services.items.slice(0, 6);

  const contact = [
    { icon: Mail, label: f.email, href: `mailto:${site.email}`, value: site.email },
    { icon: MessageCircle, label: f.whatsapp, href: whatsappLink(), value: "WhatsApp" },
    { icon: Phone, label: f.call, href: `tel:${site.phoneE164}`, value: site.phoneDisplay },
  ];

  const socials = [
    { icon: Instagram, href: site.socials.instagram, label: "Instagram" },
    { icon: Facebook, href: site.socials.facebook, label: "Facebook" },
    { icon: Linkedin, href: site.socials.linkedin, label: "LinkedIn" },
  ];

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="lg:col-span-5">
            <Logo variant="wordmark" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {f.tagline}
            </p>

            <div className="mt-8 max-w-sm">
              <p className="font-serif text-lg text-foreground">{dict.mailing.footerTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.newsletterBody}</p>
              <div className="mt-4">
                <SubscribeForm locale={locale} dict={dict.mailing} source="homepage_footer" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <FooterCol title={f.quickLinks}>
              {explore.map((l) => (
                <FooterLink key={l.href} href={l.href}>{l.label}</FooterLink>
              ))}
            </FooterCol>

            <FooterCol title={f.services}>
              {serviceLinks.map((s, i) => (
                <FooterLink key={i} href={`${base}#${sections.services}`}>{s.title}</FooterLink>
              ))}
            </FooterCol>

            <FooterCol title={f.contact}>
              {contact.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <c.icon className="h-4 w-4 text-accent" />
                    {c.value}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
                  {f.followUs}
                </span>
                <div className="flex gap-2">
                  {socials.map((s) => (
                    <Link
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-background hover:text-accent"
                    >
                      <s.icon className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </li>
            </FooterCol>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {dict.brand.name}. {f.rights}
          </p>
          <div className="flex items-center gap-6">
            <Link href={`${base}/terms`} className="transition-colors hover:text-foreground">{f.terms}</Link>
            <Link href={`${base}/privacy`} className="transition-colors hover:text-foreground">{f.privacy}</Link>
          </div>
          <p className="text-xs text-muted-foreground/70">{f.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-widest text-foreground">
        {title}
      </h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <li>
      <Link href={href} className={cn("text-sm text-muted-foreground transition-colors hover:text-foreground", className)}>
        {children}
      </Link>
    </li>
  );
}
