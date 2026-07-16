import { isLocale, type Locale } from "@/i18n/config";

const SELECTED_LANGUAGE_KEY = "dar-tahara-assistant-selected-language";

export function saveSelectedAssistantLanguage(locale: Locale) {
  window.localStorage.setItem(SELECTED_LANGUAGE_KEY, locale);
}

export function readSelectedAssistantLanguage(): Locale | null {
  const value = window.localStorage.getItem(SELECTED_LANGUAGE_KEY);
  return value && isLocale(value) ? value : null;
}

export function clearSelectedAssistantLanguage() {
  window.localStorage.removeItem(SELECTED_LANGUAGE_KEY);
}
