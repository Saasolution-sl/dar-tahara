"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatCopy } from "./website-chat";

const LazyWebsiteChat = React.lazy(async () => {
  const imported = await import("./website-chat");
  return { default: imported.WebsiteChat };
});

export function WebsiteChatLauncher({ locale, copy }: { locale: Locale; copy: ChatCopy }) {
  const [activated, setActivated] = React.useState(false);

  if (activated) {
    return (
      <React.Suspense fallback={<LauncherButton copy={copy} disabled />}>
        <LazyWebsiteChat locale={locale} copy={copy} initiallyOpen />
      </React.Suspense>
    );
  }

  return <LauncherButton copy={copy} onClick={() => setActivated(true)} />;
}

function LauncherButton({
  copy,
  disabled = false,
  onClick,
}: {
  copy: ChatCopy;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-full shadow-lift")}
        aria-label={copy.open}
      >
        <MessageCircle className="h-5 w-5" />
        {copy.open}
      </button>
    </div>
  );
}
