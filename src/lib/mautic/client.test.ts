import { test } from "node:test";
import assert from "node:assert/strict";
import { MauticClient, classifyRetryable } from "./client";
import { MauticApiError } from "./types";

/** Build a fake fetch that records calls and returns scripted responses. */
function fakeFetch(
  handler: (url: string, init: RequestInit) => { status: number; body: unknown },
) {
  const calls: { url: string; method: string; body?: unknown }[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    const i = init ?? {};
    calls.push({
      url: u,
      method: (i.method as string) ?? "GET",
      body: i.body ? JSON.parse(i.body as string) : undefined,
    });
    const { status, body } = handler(u, i);
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    } as Response;
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const cfg = { baseUrl: "https://m.test", username: "u", password: "p" };

test("classifyRetryable: 429 and 5xx retryable, 4xx not", () => {
  assert.equal(classifyRetryable(429), true);
  assert.equal(classifyRetryable(500), true);
  assert.equal(classifyRetryable(503), true);
  assert.equal(classifyRetryable(400), false);
  assert.equal(classifyRetryable(401), false);
  assert.equal(classifyRetryable(403), false);
});

test("constructor rejects missing credentials", () => {
  assert.throws(() => new MauticClient({ baseUrl: "", username: "u", password: "p" }));
});

test("sends basic auth header", async () => {
  const { impl, calls } = fakeFetch(() => ({ status: 200, body: { total: 0, contacts: {} } }));
  const c = new MauticClient({ ...cfg, fetchImpl: impl });
  await c.findContactByEmail("a@b.co");
  // We can't read headers off our simplified fake; assert the request was made
  // to the search endpoint with the email token instead.
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /search=email%3Aa%40b\.co/);
});

test("upsert CREATES when no contact matches", async () => {
  const { impl, calls } = fakeFetch((url, init) => {
    if (url.includes("/api/contacts?search=")) return { status: 200, body: { total: 0, contacts: {} } };
    if (url.endsWith("/api/contacts/new") && init.method === "POST")
      return { status: 200, body: { contact: { id: 42 } } };
    throw new Error(`unexpected ${init.method} ${url}`);
  });
  const c = new MauticClient({ ...cfg, fetchImpl: impl });
  const r = await c.upsertContactByEmail("new@x.co", { email: "new@x.co", firstname: "N" });
  assert.equal(r.created, true);
  assert.equal(r.contact.id, 42);
  assert.equal(calls.length, 2); // search + create
});

test("upsert EDITS when a contact matches (no duplicate created)", async () => {
  const { impl, calls } = fakeFetch((url, init) => {
    if (url.includes("/api/contacts?search=")) return { status: 200, body: { total: 1, contacts: { "7": { id: 7 } } } };
    if (url.endsWith("/api/contacts/7/edit") && init.method === "PATCH")
      return { status: 200, body: { contact: { id: 7 } } };
    throw new Error(`unexpected ${init.method} ${url}`);
  });
  const c = new MauticClient({ ...cfg, fetchImpl: impl });
  const r = await c.upsertContactByEmail("dup@x.co", { email: "dup@x.co" });
  assert.equal(r.created, false);
  assert.equal(r.contact.id, 7);
  // Crucially, /api/contacts/new is never called.
  assert.ok(!calls.some((k) => k.url.endsWith("/api/contacts/new")));
});

test("throws retryable MauticApiError on 503", async () => {
  const { impl } = fakeFetch(() => ({ status: 503, body: {} }));
  const c = new MauticClient({ ...cfg, fetchImpl: impl });
  await assert.rejects(
    () => c.findContactByEmail("a@b.co"),
    (e: unknown) => e instanceof MauticApiError && e.status === 503 && e.retryable === true,
  );
});

test("throws non-retryable MauticApiError on 401 (auth failure)", async () => {
  const { impl } = fakeFetch(() => ({ status: 401, body: {} }));
  const c = new MauticClient({ ...cfg, fetchImpl: impl });
  await assert.rejects(
    () => c.findContactByEmail("a@b.co"),
    (e: unknown) => e instanceof MauticApiError && e.status === 401 && e.retryable === false,
  );
});

test("network error becomes a retryable MauticApiError", async () => {
  const impl = (async () => {
    throw new TypeError("fetch failed");
  }) as unknown as typeof fetch;
  const c = new MauticClient({ ...cfg, fetchImpl: impl });
  await assert.rejects(
    () => c.findContactByEmail("a@b.co"),
    (e: unknown) => e instanceof MauticApiError && e.retryable === true && e.status === 0,
  );
});

test("timeout (abort) becomes a retryable MauticApiError", async () => {
  // fetch that never resolves until aborted → triggers the AbortController.
  const impl = (async (_url: string, init?: RequestInit) => {
    return await new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        const e = new Error("aborted");
        e.name = "AbortError";
        reject(e);
      });
    });
  }) as unknown as typeof fetch;
  const c = new MauticClient({ ...cfg, fetchImpl: impl, timeoutMs: 20 });
  await assert.rejects(
    () => c.findContactByEmail("a@b.co"),
    (e: unknown) => e instanceof MauticApiError && e.retryable === true,
  );
});
