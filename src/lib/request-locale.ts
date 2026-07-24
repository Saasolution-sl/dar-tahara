import "server-only";

import { cookies, headers } from "next/headers";
import { isLocale, localeCookieName, type Locale } from "@/i18n/config";

export async function getRequestLocale(): Promise<Locale> {
  const headerValue = (await headers()).get("x-dar-tahara-locale");
  if (headerValue && isLocale(headerValue)) return headerValue;

  const value = (await cookies()).get(localeCookieName)?.value;
  return value && isLocale(value) ? value : "en";
}
