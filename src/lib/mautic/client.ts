/**
 * Mautic REST client.
 *
 * Deliberately dependency-injected: the constructor takes a `fetchImpl`, so every
 * network behaviour — success, 4xx, 5xx, 429, timeout — is exercised in tests
 * without touching the network. There is NO `import "server-only"` here so the
 * class stays testable; the credential-reading factory lives in ./env, which is
 * the server-only entry point used by route handlers.
 *
 * Retry policy (classifyRetryable): network errors, timeouts, HTTP 429 and 5xx
 * are transient → retryable. HTTP 4xx (auth, validation) is permanent → do not
 * retry, because retrying a bad request just wastes attempts.
 */
import {
  MauticApiError,
  type MauticContact,
  type MauticContactFields,
} from "./types";

export type MauticClientConfig = {
  baseUrl: string;
  username: string;
  password: string;
  /** Injected for tests; defaults to global fetch in production. */
  fetchImpl?: typeof fetch;
  /** Per-request timeout in ms. */
  timeoutMs?: number;
};

export function classifyRetryable(status: number): boolean {
  if (status === 429) return true;
  if (status >= 500) return true;
  return false; // 4xx (incl. 401/403 auth, 400 validation) are permanent.
}

export class MauticClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(config: MauticClientConfig) {
    if (!config.baseUrl || !config.username || !config.password) {
      throw new Error("MauticClient requires baseUrl, username and password");
    }
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.authHeader =
      "Basic " + Buffer.from(`${config.username}:${config.password}`).toString("base64");
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.timeoutMs = config.timeoutMs ?? 10_000;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (err) {
      // Network error or abort (timeout) — always transient.
      const isAbort = err instanceof Error && err.name === "AbortError";
      throw new MauticApiError(
        isAbort ? "Mautic request timed out" : "Mautic request failed",
        0,
        true,
      );
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      throw new MauticApiError(
        `Mautic API ${method} ${path} → ${res.status}`,
        res.status,
        classifyRetryable(res.status),
      );
    }
    return (await res.json()) as T;
  }

  /**
   * Find a contact by exact email. Mautic's `search` supports the `email:` token;
   * we additionally verify the returned contact's email to avoid partial matches.
   */
  async findContactByEmail(email: string): Promise<MauticContact | null> {
    const q = encodeURIComponent(`email:${email}`);
    const data = await this.request<{ total: number | string; contacts: Record<string, MauticContact> }>(
      "GET",
      `/api/contacts?search=${q}&limit=1&minimal=true`,
    );
    const list = Object.values(data.contacts ?? {});
    return list.length > 0 ? list[0] : null;
  }

  async createContact(fields: MauticContactFields): Promise<MauticContact> {
    const data = await this.request<{ contact: MauticContact }>(
      "POST",
      "/api/contacts/new",
      fields,
    );
    return data.contact;
  }

  async editContact(id: number, fields: MauticContactFields): Promise<MauticContact> {
    // PATCH = partial update: only the fields we send change; everything else on
    // the contact (including Mautic-managed engagement data) is left intact.
    const data = await this.request<{ contact: MauticContact }>(
      "PATCH",
      `/api/contacts/${id}/edit`,
      fields,
    );
    return data.contact;
  }

  /**
   * Idempotent upsert keyed on email: update the existing contact if one is
   * found, otherwise create. This is what prevents a duplicate Mautic contact on
   * every repeat form submission (brief §18).
   */
  async upsertContactByEmail(
    email: string,
    fields: MauticContactFields,
  ): Promise<{ contact: MauticContact; created: boolean }> {
    const existing = await this.findContactByEmail(email);
    if (existing) {
      const contact = await this.editContact(existing.id, fields);
      return { contact, created: false };
    }
    const contact = await this.createContact(fields);
    return { contact, created: true };
  }

  async addTags(id: number, tags: string[]): Promise<void> {
    if (tags.length === 0) return;
    // Editing the `tags` field merges by default; existing tags are preserved.
    await this.editContact(id, { tags: tags.join(",") } as unknown as MauticContactFields);
  }

  async addToSegment(contactId: number, segmentId: number): Promise<void> {
    await this.request("POST", `/api/segments/${segmentId}/contact/${contactId}/add`);
  }
}
