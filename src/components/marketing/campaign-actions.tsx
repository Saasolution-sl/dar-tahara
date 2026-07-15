"use client";

import * as React from "react";
import { Check, CheckCircle2, Copy, MessageCircle, Share2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { CampaignCopy } from "@/i18n/campaign-copy";
import { SubscribeForm } from "@/components/mailing-list/subscribe-form";
import { buttonVariants } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function CampaignSignup({
  locale,
  mailing,
  copy,
  shareUrl,
}: {
  locale: Locale;
  mailing: Dictionary["mailing"];
  copy: CampaignCopy;
  shareUrl: string;
}) {
  const [joined, setJoined] = React.useState(false);

  return (
    <div>
      <SubscribeForm
        locale={locale}
        dict={mailing}
        source="launch_page"
        labels={{
          emailPlaceholder: copy.emailPlaceholder,
          button: copy.formCta,
          consent: copy.formConsent,
          success: copy.success,
        }}
        onSuccess={() => setJoined(true)}
      />
      {joined ? (
        <div className="mt-5 border-t border-border pt-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {copy.shareTitle}
          </p>
          <ShareButtons copy={copy} shareUrl={shareUrl} compact />
        </div>
      ) : null}
    </div>
  );
}

export function ShareButtons({
  copy,
  shareUrl,
  compact = false,
}: {
  copy: CampaignCopy;
  shareUrl: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${copy.shareMessage}\n${shareUrl}`)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
      track("campaign_link_copied", { campaign: "early_access" });
    } catch {
      window.prompt(copy.copyCta, shareUrl);
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Dar Tahara", text: copy.shareMessage, url: shareUrl });
        track("campaign_share_clicked", { channel: "native", campaign: "early_access" });
        return;
      } catch {
        return;
      }
    }
    await copyLink();
  }

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", compact && "sm:flex-wrap")}>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("campaign_share_clicked", { channel: "whatsapp", campaign: "early_access" })}
        className={cn(buttonVariants({ variant: "primary", size: compact ? "md" : "lg" }), "bg-[#1f7a4d] hover:bg-[#17623e]")}
      >
        <MessageCircle className="h-4 w-4" />
        {copy.whatsappCta}
      </a>
      <button
        type="button"
        onClick={nativeShare}
        className={buttonVariants({ variant: "outline", size: compact ? "md" : "lg" })}
      >
        <Share2 className="h-4 w-4" />
        {copy.nativeShareCta}
      </button>
      <button
        type="button"
        onClick={copyLink}
        className={buttonVariants({ variant: "ghost", size: compact ? "md" : "lg" })}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? copy.copied : copy.copyCta}
      </button>
    </div>
  );
}
