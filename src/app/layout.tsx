import type { ReactNode } from "react";
import { fontSans, fontSerif } from "./fonts";
import "./globals.css";
import { getDir, localeMeta } from "@/i18n/config";
import { getRequestLocale } from "@/lib/request-locale";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getRequestLocale();

  return (
    <html
      lang={localeMeta[locale].hreflang}
      dir={getDir(locale)}
      suppressHydrationWarning
      className={cn(fontSerif.variable, fontSans.variable)}
    >
      <body className="min-h-dvh bg-background">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
