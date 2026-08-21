#!/usr/bin/env sh
set -eu

ENV_FILE="${SECURITY_RECEIVER_ENV_FILE:-/srv/dartahara/security-receiver/.env}"
BASE_URL="${SECURITY_RECEIVER_BASE_URL:-https://staging.dartahara.com/api/internal}"
SECURITY_EVENT_DELIVERY_TOKEN="$(sed -n 's/^SECURITY_EVENT_DELIVERY_TOKEN=//p' "$ENV_FILE")"
: "${SECURITY_EVENT_DELIVERY_TOKEN:?SECURITY_EVENT_DELIVERY_TOKEN is required}"

event_id="$(cat /proc/sys/kernel/random/uuid)"
occurred_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
event="{\"eventId\":\"$event_id\",\"occurredAt\":\"$occurred_at\",\"type\":\"control_drift_detected\",\"severity\":\"high\",\"source\":\"application\",\"actorId\":null,\"correlationId\":\"receiver-live-test\",\"metadata\":{\"route_class\":\"operational_verification\",\"test_event\":true}}"

for channel in security-log security-alert; do
  result="$(printf '%s' "$event" | curl --silent --show-error \
    --request POST "$BASE_URL/$channel" \
    --header "Authorization: Bearer $SECURITY_EVENT_DELIVERY_TOKEN" \
    --header "Content-Type: application/json" \
    --data-binary @-)"
  printf '%s=%s\n' "$channel" "$result"
  printf '%s' "$result" | grep -q '"accepted":true'
done
