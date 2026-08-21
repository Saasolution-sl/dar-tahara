import { randomUUID } from "node:crypto";

const token = process.env.SECURITY_EVENT_DELIVERY_TOKEN;
const baseUrl = process.env.SECURITY_RECEIVER_BASE_URL || "http://127.0.0.1:8080/api/internal";
if (!token) throw new Error("SECURITY_EVENT_DELIVERY_TOKEN is required");

const event = {
  eventId: randomUUID(),
  occurredAt: new Date().toISOString(),
  type: "control_drift_detected",
  severity: "high",
  source: "application",
  actorId: null,
  correlationId: "receiver-live-test",
  metadata: { route_class: "operational_verification", test_event: true },
};

for (const channel of ["security-log", "security-alert"]) {
  const response = await fetch(`${baseUrl}/${channel}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  const result = await response.json();
  console.log(`${channel}_status=${response.status} accepted=${String(result.accepted)} alertSent=${String(result.alertSent)} error=${String(result.error)}`);
  if (!response.ok || result.accepted !== true) process.exitCode = 1;
}
