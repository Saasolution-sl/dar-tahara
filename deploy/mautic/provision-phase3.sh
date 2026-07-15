#!/usr/bin/env bash
#
# Phase 3 Mautic provisioning: lead-scoring fields + behavioural point actions.
#
# Idempotent. Run on the VPS (talks to the Mautic API over the PUBLIC https URL —
# since trusted_proxies is set, Mautic enforces https and rejects internal http).
#
# Scoring model split:
#   - DATA-driven points (email verified, city, frequency, access, referrals) are
#     computed by the Dar Tahara app (src/lib/mautic/scoring.ts) and written to
#     the `lead_score` field on sync. Documented + adjustable in code.
#   - BEHAVIOURAL points (opens/clicks/returns) live in Mautic as point actions,
#     because only Mautic sees those events. Created below.
#
# Usage: sudo ./provision-phase3.sh
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "run as root" >&2; exit 1; }

CRED=/root/mautic-admin-credentials.txt
USER="$(sed -n 's/^username=//p' "$CRED")"
PW="$(sed -n 's/^password=//p' "$CRED")"
BASE="https://marketing.saasolution.es"

created=0; existed=0; failed=0
api() {
  local method="$1" path="$2" body="${3:-}"
  if [[ -n "$body" ]]; then
    printf '%s' "$body" > /tmp/mautic-p3.json
    curl -sS -u "${USER}:${PW}" -H 'Content-Type: application/json' -X "$method" -d @/tmp/mautic-p3.json "${BASE}${path}"
  else
    curl -sS -u "${USER}:${PW}" -X "$method" "${BASE}${path}"
  fi
}
report() {
  local what="$1" resp="$2"
  if grep -q '"errors"' <<<"$resp"; then
    if grep -qiE 'unique|already|must be unique' <<<"$resp"; then echo "  = ${what} (exists)"; existed=$((existed+1));
    else echo "  ! ${what} FAILED: $(head -c 200 <<<"$resp")"; failed=$((failed+1)); fi
  else echo "  + ${what}"; created=$((created+1)); fi
}

# ── Lead-scoring custom fields ─────────────────────────────────────────────────
echo "==> fields"
report "field lead_score" "$(api POST /api/fields/contact/new \
  '{"label":"Lead Score","alias":"lead_score","type":"number","group":"core","isPublished":true}')"

STAGE_OPTS='[{"label":"Anonymous Visitor","value":"anonymous_visitor"},{"label":"Early Access Submitted","value":"early_access_submitted"},{"label":"Email Verified","value":"email_verified"},{"label":"Marketing Qualified Lead","value":"marketing_qualified_lead"},{"label":"Service Area Waitlist","value":"service_area_waitlist"},{"label":"Invited to Book","value":"invited_to_book"},{"label":"Customer","value":"customer"}]'
report "field lead_stage" "$(api POST /api/fields/contact/new \
  "{\"label\":\"Lead Stage\",\"alias\":\"lead_stage\",\"type\":\"select\",\"group\":\"core\",\"isPublished\":true,\"properties\":{\"list\":${STAGE_OPTS}}}")"

# ── Behavioural point actions ──────────────────────────────────────────────────
# Only event-based points belong here. `email.open` fires when a contact opens
# any Dar Tahara email (the launch/welcome emails are the meaningful ones).
echo "==> behavioural points"
# Skip if a point with this name already exists (points have no unique alias).
existing_points="$(api GET '/api/points?limit=200')"
mk_point() {
  local name="$1" body="$2"
  if grep -qF "\"name\":\"${name}\"" <<<"$existing_points"; then
    echo "  = point ${name} (exists)"; existed=$((existed+1)); return
  fi
  report "point ${name}" "$(api POST /api/points/new "$body")"
}
mk_point "Opens a Dar Tahara email" \
  '{"name":"Opens a Dar Tahara email","type":"email.open","delta":2,"properties":{"emails":[]},"isPublished":true}'

# URL-hit points (returns to early-access +3, clicks a booking link +5) depend on
# the exact tracked URLs, which only carry meaning once the booking feature is
# live. They are documented here and should be added in the UI when those URLs
# exist:  Points → New → "Visits specific URL" with URL
#   https://dartahara.com/*/early-access   (+3)
#   https://dartahara.com/*/book*          (+5)

rm -f /tmp/mautic-p3.json
echo
echo "created: ${created}  existed: ${existed}  failed: ${failed}"
[[ "${failed}" -eq 0 ]] || exit 1
