import "server-only";

import { createHash } from "node:crypto";
import { isLocale, type Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import {
  isServiceRoleConfigured,
  serviceInsert,
  serviceRpc,
  serviceSelect,
  serviceUpdate,
} from "@/lib/supabase-rpc";
import { generateEmbeddings, vectorLiteral } from "./embeddings";

const ALLOWED_HOSTS = new Set(["dartahara.com", "www.dartahara.com"]);
const BLOCKED_PATH = /^\/(?:[a-z]{2}\/)?(?:admin|api|_next|auth|account|invite|assessment|subscribe|forgot-password|reset-password|preview|draft|staging)(?:\/|$)/i;
const MAX_PAGES = 250;
const MAX_HTML_BYTES = 2_000_000;
const CHUNK_TARGET = 1_200;
const CHUNK_OVERLAP = 180;

type SitemapPage = { url: string; lastModified: string | null };
type RecordedPage = { source_id: string; version_id: string; changed: boolean };

export type WebsiteSyncResult = {
  discovered: number;
  indexed: number;
  unchanged: number;
  failed: number;
  blocked: number;
  chunks: number;
};

export type WebsiteSourceAdminRow = {
  id: string;
  canonical_url: string;
  title: string;
  page_type: string;
  language: Locale;
  status: string;
  latest_content_hash: string | null;
  sitemap_last_modified: string | null;
  last_crawled_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'");
}

function decodeHtml(value: string): string {
  return decodeXml(value)
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

export function canonicalWebsiteUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return null;
    if (BLOCKED_PATH.test(url.pathname) || url.pathname.includes("/.") || url.searchParams.has("preview")) return null;
    url.hostname = "www.dartahara.com";
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
    return url.toString();
  } catch {
    return null;
  }
}

function inferLocale(url: URL, html: string): Locale {
  const htmlLang = html.match(/<html[^>]*\blang=["']?([a-z]{2})/i)?.[1]?.toLowerCase();
  if (htmlLang && isLocale(htmlLang)) return htmlLang;
  const pathLocale = url.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return pathLocale && isLocale(pathLocale) ? pathLocale : "en";
}

function inferPageType(pathname: string): string {
  const path = pathname.toLowerCase();
  if (path.includes("/services")) return "services";
  if (path.includes("/pricing") || path.includes("/plans")) return "pricing";
  if (path.includes("/faq")) return "faq";
  if (path.includes("/terms")) return "terms";
  if (path.includes("/privacy")) return "privacy";
  if (path.includes("/about") || path.includes("/mission")) return "about";
  if (path.includes("/early-access")) return "early_access";
  if (path.includes("/blog")) return "blog";
  if (path === "/" || /^\/[a-z]{2}$/.test(path)) return "home";
  return "other";
}

const INJECTION_PATTERNS = [
  /ignore (?:all |any )?(?:previous|prior|system) instructions?/i,
  /\bsystem prompt\b/i,
  /\byou are (?:chatgpt|an ai|the assistant)\b/i,
  /\bdeveloper message\b/i,
  /reveal (?:your|the) (?:prompt|instructions?)/i,
];

export function extractWebsiteText(html: string): {
  title: string;
  text: string;
  securityFlags: string[];
} {
  const title = decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
    .replace(/\s+/g, " ").trim().slice(0, 500);
  let body = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|iframe|canvas|template|nav|footer|form)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(header)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(?:p|div|section|article|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  body = decodeHtml(body).replace(/\r/g, "\n").replace(/[ \t]+/g, " ");

  const securityFlags: string[] = [];
  const unique = new Set<string>();
  const blocks: string[] = [];
  for (const raw of body.split(/\n+/)) {
    const block = raw.replace(/\s+/g, " ").trim();
    if (block.length < 2) continue;
    const injection = INJECTION_PATTERNS.find((pattern) => pattern.test(block));
    if (injection) {
      securityFlags.push("instruction_like_content_removed");
      continue;
    }
    const fingerprint = block.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ");
    if (unique.has(fingerprint)) continue;
    unique.add(fingerprint);
    blocks.push(block);
  }
  return { title, text: blocks.join("\n").slice(0, 250_000), securityFlags: [...new Set(securityFlags)] };
}

export function chunkWebsiteText(text: string): string[] {
  const paragraphs = text.split(/\n+/).map((item) => item.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 1 > CHUNK_TARGET) {
      chunks.push(current.trim());
      current = `${current.slice(-CHUNK_OVERLAP)} ${paragraph}`;
    } else {
      current = current ? `${current}\n${paragraph}` : paragraph;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((chunk) => chunk.length >= 40).slice(0, 200);
}

async function safeWebsiteFetch(value: string, accept: string, redirects = 0): Promise<Response> {
  const canonical = canonicalWebsiteUrl(value);
  if (!canonical) throw new Error("website_url_not_allowed");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(canonical, {
      headers: {
        Accept: accept,
        "User-Agent": "DarTaharaKnowledgeIndexer/1.0 (+https://www.dartahara.com)",
      },
      redirect: "manual",
      signal: controller.signal,
      cache: "no-store",
    });
    if (response.status >= 300 && response.status < 400) {
      if (redirects >= 3) throw new Error("website_redirect_limit");
      const location = response.headers.get("location");
      if (!location) throw new Error("website_redirect_without_location");
      return safeWebsiteFetch(new URL(location, canonical).toString(), accept, redirects + 1);
    }
    const length = Number(response.headers.get("content-length") || 0);
    if (length > MAX_HTML_BYTES) throw new Error("website_response_too_large");
    if (!response.ok) throw new Error(`website_http_${response.status}`);
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function readLimitedText(response: Response): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    bytes += part.value.byteLength;
    if (bytes > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new Error("website_response_too_large");
    }
    text += decoder.decode(part.value, { stream: true });
  }
  return text + decoder.decode();
}

function parseSitemap(xml: string): { pages: SitemapPage[]; childSitemaps: string[] } {
  const pages: SitemapPage[] = [];
  const childSitemaps: string[] = [];
  const isIndex = /<sitemapindex\b/i.test(xml);
  const blockPattern = isIndex ? /<sitemap\b[\s\S]*?<\/sitemap>/gi : /<url\b[\s\S]*?<\/url>/gi;
  for (const block of xml.match(blockPattern) || []) {
    const loc = decodeXml(block.match(/<loc>\s*([\s\S]*?)\s*<\/loc>/i)?.[1] || "").trim();
    const canonical = canonicalWebsiteUrl(loc);
    if (!canonical) continue;
    if (isIndex) childSitemaps.push(canonical);
    else pages.push({
      url: canonical,
      lastModified: block.match(/<lastmod>\s*([\s\S]*?)\s*<\/lastmod>/i)?.[1]?.trim() || null,
    });
  }
  return { pages, childSitemaps };
}

async function discoverSitemapPages(sitemapUrl: string, depth = 0): Promise<SitemapPage[]> {
  if (depth > 2) return [];
  const response = await safeWebsiteFetch(sitemapUrl, "application/xml,text/xml;q=0.9,*/*;q=0.1");
  const xml = await readLimitedText(response);
  const parsed = parseSitemap(xml);
  const childPages = await Promise.all(parsed.childSitemaps.slice(0, 20)
    .map((child) => discoverSitemapPages(child, depth + 1).catch(() => [])));
  const deduped = new Map<string, SitemapPage>();
  for (const page of [...parsed.pages, ...childPages.flat()]) deduped.set(page.url, page);
  return [...deduped.values()].slice(0, MAX_PAGES);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function recordFailure(url: string, error: unknown) {
  const canonical = canonicalWebsiteUrl(url);
  if (!canonical || !isServiceRoleConfigured()) return;
  const failure = error instanceof Error ? error.message.slice(0, 300) : "unknown_error";
  await serviceUpdate("website_sources", `canonical_url=eq.${encodeURIComponent(canonical)}`, {
    status: "error",
    last_error: failure,
    last_crawled_at: new Date().toISOString(),
  }).catch(() => undefined);
}

async function indexPage(page: SitemapPage): Promise<{ changed: boolean; chunks: number }> {
  const response = await safeWebsiteFetch(page.url, "text/html,application/xhtml+xml;q=0.9");
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/html")) throw new Error("website_not_html");
  const html = await readLimitedText(response);
  const canonical = canonicalWebsiteUrl(response.url || page.url) || page.url;
  const url = new URL(canonical);
  const extracted = extractWebsiteText(html);
  if (extracted.text.length < 80) throw new Error("website_content_too_short");
  const language = inferLocale(url, html);
  const contentHash = sha256(extracted.text);
  const recorded = await serviceRpc<RecordedPage[]>("record_website_page_version", {
    p_canonical_url: canonical,
    p_title: extracted.title || url.pathname,
    p_page_type: inferPageType(url.pathname),
    p_language: language,
    p_content_hash: contentHash,
    p_extracted_text: extracted.text,
    p_sitemap_last_modified: page.lastModified,
    p_security_flags: extracted.securityFlags,
    p_metadata: { indexed_from: "sitemap", path: url.pathname },
  });
  const row = recorded[0];
  if (!row) throw new Error("website_page_record_failed");
  if (!row.changed) return { changed: false, chunks: 0 };

  const chunks = chunkWebsiteText(extracted.text);
  const embeddings: Array<Awaited<ReturnType<typeof generateEmbeddings>>[number]> = [];
  for (let start = 0; start < chunks.length; start += 32) {
    embeddings.push(...await generateEmbeddings(chunks.slice(start, start + 32)));
  }
  const rows: Array<Record<string, unknown>> = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const content = chunks[index];
    const embedding = embeddings[index];
    rows.push({
      source_id: row.source_id,
      version_id: row.version_id,
      chunk_index: index,
      content,
      content_hash: sha256(content),
      embedding: vectorLiteral(embedding?.vector),
      embedding_model: embedding?.model || null,
      metadata: { canonical_url: canonical, language },
    });
  }
  if (rows.length) await serviceInsert("website_embeddings", rows);
  return { changed: true, chunks: rows.length };
}

export async function syncWebsiteContent(): Promise<WebsiteSyncResult> {
  if (!isServiceRoleConfigured()) throw new Error("service_role_not_configured");
  const sitemapUrl = canonicalWebsiteUrl(
    process.env.ASSISTANT_WEBSITE_SITEMAP_URL || `${site.url}/sitemap.xml`,
  );
  if (!sitemapUrl) throw new Error("invalid_sitemap_url");

  const pages = await discoverSitemapPages(sitemapUrl);
  const result: WebsiteSyncResult = {
    discovered: pages.length,
    indexed: 0,
    unchanged: 0,
    failed: 0,
    blocked: 0,
    chunks: 0,
  };
  for (const page of pages) {
    if (!canonicalWebsiteUrl(page.url)) {
      result.blocked += 1;
      continue;
    }
    try {
      const indexed = await indexPage(page);
      if (indexed.changed) result.indexed += 1;
      else result.unchanged += 1;
      result.chunks += indexed.chunks;
    } catch (error) {
      result.failed += 1;
      await recordFailure(page.url, error);
    }
  }
  console.info(JSON.stringify({
    scope: "assistant_website_indexer",
    event: "website_sync_completed",
    ...result,
    contentLogged: false,
  }));
  return result;
}

export async function loadWebsiteSources(): Promise<WebsiteSourceAdminRow[]> {
  if (!isServiceRoleConfigured()) throw new Error("service_role_not_configured");
  return serviceSelect<WebsiteSourceAdminRow[]>(
    "website_sources?select=id,canonical_url,title,page_type,language,status,latest_content_hash,sitemap_last_modified,last_crawled_at,last_error,created_at,updated_at&order=updated_at.desc&limit=250",
  );
}
