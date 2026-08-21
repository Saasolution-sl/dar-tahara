import { createHash, timingSafeEqual } from "node:crypto";
import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import http from "node:http";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const LOG_PATH = "/api/internal/security-log";
const ALERT_PATH = "/api/internal/security-alert";
const ZERO_HASH = "0".repeat(64);
const EVENT_TYPES = new Set([
  "authorization_denied",
  "privileged_mfa_required",
  "rate_limit_blocked",
  "rate_limit_control_unavailable",
  "security_configuration_error",
  "file_upload_rejected",
  "csp_violation",
  "control_drift_detected",
  "retention_control_blocked",
]);

function integer(value, fallback) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function json(response, status, body) {
  const encoded = JSON.stringify(body);
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(encoded),
    "X-Content-Type-Options": "nosniff",
  });
  response.end(encoded);
}

function authorized(value, token) {
  if (typeof value !== "string" || !value.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(value.slice(7));
  const expected = Buffer.from(token);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function readBody(request, maximum) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let settled = false;
    const chunks = [];
    request.on("data", (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > maximum) {
        settled = true;
        reject(new Error("event_too_large"));
        request.resume();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (!settled) resolve(Buffer.concat(chunks, size));
    });
    request.on("error", (error) => {
      if (!settled) reject(error);
    });
  });
}

function invalidEventReason(event) {
  if (!event || typeof event !== "object" || Array.isArray(event)) return "invalid_event_shape";
  if (typeof event.eventId !== "string" || !/^[0-9a-f-]{36}$/i.test(event.eventId)) return "invalid_event_id";
  if (typeof event.occurredAt !== "string" || Number.isNaN(Date.parse(event.occurredAt))) return "invalid_occurred_at";
  if (!["low", "medium", "high", "critical"].includes(event.severity)) return "invalid_severity";
  if (event.source !== "application" || !EVENT_TYPES.has(event.type)) return "invalid_source_or_type";
  if (!(event.actorId === null || (typeof event.actorId === "string" && event.actorId.length <= 200))) return "invalid_actor";
  if (!(event.correlationId === null || (typeof event.correlationId === "string" && event.correlationId.length <= 200))) return "invalid_correlation";
  if (!event.metadata || typeof event.metadata !== "object" || Array.isArray(event.metadata)) return "invalid_metadata";
  const metadataEntries = Object.entries(event.metadata);
  if (metadataEntries.length > 20 || metadataEntries.some(([key, value]) =>
    !/^[a-z][a-z0-9_]{0,63}$/i.test(key)
    || !(value === null || typeof value === "number" || typeof value === "boolean" || (typeof value === "string" && value.length <= 200)))) {
    return "invalid_metadata";
  }
  return null;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

async function sendAlert(event, configuration, fetchImpl) {
  if (!configuration.resendKey || !configuration.alertEmail || !configuration.fromEmail) return false;
  const metadata = escapeHtml(JSON.stringify(event.metadata));
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${configuration.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: configuration.fromEmail,
      to: configuration.alertEmail,
      subject: `[Dar Tahara security] ${event.severity.toUpperCase()}: ${event.type}`,
      html: `<h1>Dar Tahara security event</h1><p><strong>Severity:</strong> ${escapeHtml(event.severity)}</p><p><strong>Type:</strong> ${escapeHtml(event.type)}</p><p><strong>Event ID:</strong> ${escapeHtml(event.eventId)}</p><p><strong>Occurred:</strong> ${escapeHtml(event.occurredAt)}</p><p><strong>Metadata:</strong> <code>${metadata}</code></p>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  return response.ok;
}

export function createReceiverServer(options = {}) {
  const token = options.token || process.env.SECURITY_EVENT_DELIVERY_TOKEN;
  if (!token || token.length < 32) throw new Error("SECURITY_EVENT_DELIVERY_TOKEN must contain at least 32 characters");
  const dataDir = options.dataDir || process.env.DATA_DIR || "/data";
  const maximum = integer(String(options.maximum || process.env.MAX_EVENT_BYTES || ""), 65_536);
  const fetchImpl = options.fetchImpl || fetch;
  const configuration = {
    resendKey: options.resendKey || process.env.RESEND_API_KEY,
    alertEmail: options.alertEmail || process.env.SECURITY_ALERT_EMAIL,
    fromEmail: options.fromEmail || process.env.MAILING_FROM_EMAIL,
  };
  let writeQueue = Promise.resolve();
  let chainHead;

  async function appendEvent(event, channel) {
    const operation = async () => {
      await mkdir(dataDir, { recursive: true });
      if (!chainHead) chainHead = (await readFile(join(dataDir, ".chain-head"), "utf8").catch(() => ZERO_HASH)).trim() || ZERO_HASH;
      const receivedAt = new Date().toISOString();
      const record = { receivedAt, channel, previousHash: chainHead, event };
      const recordHash = createHash("sha256").update(JSON.stringify(record)).digest("hex");
      const datedLog = join(dataDir, `security-events-${receivedAt.slice(0, 10)}.jsonl`);
      await appendFile(datedLog, JSON.stringify({ ...record, recordHash }) + "\n", { encoding: "utf8", mode: 0o600 });
      const temporary = join(dataDir, ".chain-head.next");
      await writeFile(temporary, recordHash + "\n", { encoding: "utf8", mode: 0o600 });
      await rename(temporary, join(dataDir, ".chain-head"));
      chainHead = recordHash;
    };
    writeQueue = writeQueue.then(operation, operation);
    return writeQueue;
  }

  const server = http.createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/healthz") return json(response, 200, { healthy: true });
    if (request.method !== "POST" || ![LOG_PATH, ALERT_PATH].includes(request.url || "")) return json(response, 404, { error: "not_found" });
    if (!authorized(request.headers.authorization, token)) return json(response, 401, { error: "unauthorized" });
    if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) return json(response, 415, { error: "unsupported_media_type" });

    let event;
    try {
      const body = await readBody(request, maximum);
      event = JSON.parse(body.toString("utf8"));
    } catch (error) {
      const code = error instanceof Error ? error.message : "invalid_event";
      return json(response, code === "event_too_large" ? 413 : 400, { error: code === "event_too_large" ? code : "invalid_event" });
    }

    const invalidReason = invalidEventReason(event);
    if (invalidReason) return json(response, 400, { error: invalidReason });
    const channel = request.url === ALERT_PATH ? "alert" : "log";
    try {
      await appendEvent(event, channel);
    } catch {
      return json(response, 503, { error: "persistence_unavailable" });
    }
    if (channel === "alert") {
      try {
        if (!(await sendAlert(event, configuration, fetchImpl))) {
          return json(response, 502, { accepted: true, alertSent: false, eventId: event.eventId });
        }
      } catch {
        return json(response, 502, { accepted: true, alertSent: false, eventId: event.eventId });
      }
    }
    return json(response, 202, { accepted: true, alertSent: channel === "alert", eventId: event.eventId });
  });
  server.headersTimeout = 15_000;
  server.requestTimeout = 20_000;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createReceiverServer();
  server.listen(integer(process.env.LISTEN_PORT, 8080), process.env.LISTEN_HOST || "127.0.0.1", () => {
    process.stdout.write(JSON.stringify({ scope: "security_receiver", event: "listening" }) + "\n");
  });
}
