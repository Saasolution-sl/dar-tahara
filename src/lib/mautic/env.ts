import "server-only";
import { MauticClient } from "./client";

/**
 * Server-only factory that builds a MauticClient from environment variables.
 * This is the ONLY place Mautic credentials are read, and importing it from the
 * browser bundle is a build error (server-only). Route handlers call this;
 * everything else takes an injected client so it stays testable.
 *
 * Returns null when Mautic is not configured, so the website degrades gracefully:
 * the lead is still saved to Supabase and marked `pending` for later reconcile
 * (brief §36 — a temporary Mautic absence must never lose a valid lead).
 */
export function mauticFromEnv(): MauticClient | null {
  const baseUrl = process.env.MAUTIC_BASE_URL;
  const username = process.env.MAUTIC_API_USERNAME;
  const password = process.env.MAUTIC_API_PASSWORD;
  if (!baseUrl || !username || !password) return null;

  return new MauticClient({
    baseUrl,
    username,
    password,
    timeoutMs: Number(process.env.MAUTIC_API_TIMEOUT_MS) || 10_000,
  });
}

export function isMauticConfigured(): boolean {
  return Boolean(
    process.env.MAUTIC_BASE_URL &&
      process.env.MAUTIC_API_USERNAME &&
      process.env.MAUTIC_API_PASSWORD,
  );
}
