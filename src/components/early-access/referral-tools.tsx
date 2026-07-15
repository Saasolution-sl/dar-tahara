"use client";

import * as React from "react";
import { Copy, Check, MessageCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { EarlyAccessCopy } from "@/i18n/early-access-copy";
import { track } from "@/lib/analytics";

/**
 * Referral sharing tools shown on the success page after verification. Builds the
 * personal invitation link (…/early-access?ref=CODE), a copy-to-clipboard button
 * and a WhatsApp share with the translated invite message.
 */
export function ReferralTools({
  locale, copy, referralCode, baseUrl,
}: {
  locale: Locale; copy: EarlyAccessCopy; referralCode: string; baseUrl: string;
}) {
  const link = `${baseUrl}/${locale}/early-access?ref=${encodeURIComponent(referralCode)}`;
  const message = copy.success.shareMessage.replace("{link}", link);
  const [copied, setCopied] = React.useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      track("referral_link_copied", {});
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the input below still lets them copy manually */
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="mt-8 rounded-2xl border border-border bg-background/70 p-5 text-start">
      <h3 className="text-base font-semibold text-foreground">{copy.success.shareTitle}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{copy.success.shareBody}</p>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <input
          readOnly
          value={link}
          aria-label={copy.success.shareTitle}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none sm:text-sm"
        />
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary/70"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? copy.success.copied : copy.success.copy}
        </button>
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("whatsapp_share_clicked", {})}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
      >
        <MessageCircle className="h-4 w-4" />
        {copy.success.whatsapp}
      </a>
    </div>
  );
}
