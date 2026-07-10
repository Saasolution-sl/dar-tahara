import type { ReactNode } from "react";
import "./globals.css";

/**
 * Passthrough root layout. The real <html>/<body> shell lives in
 * app/[locale]/layout.tsx so that `lang` and `dir` can be set per-locale.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
