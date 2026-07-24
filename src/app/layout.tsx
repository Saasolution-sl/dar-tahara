import type { ReactNode } from "react";
import { fontSans, fontSerif } from "./fonts";
import "./globals.css";
import { getDir, localeMeta } from "@/i18n/config";
import { getRequestLocale } from "@/lib/request-locale";
import { cn } from "@/lib/utils";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getRequestLocale();

  return (
    <html
      lang={localeMeta[locale].hreflang}
      dir={getDir(locale)}
      suppressHydrationWarning
      className={cn(fontSerif.variable, fontSans.variable)}
    >
      <body className="min-h-dvh bg-background">{children}</body>
    </html>
  );
}
