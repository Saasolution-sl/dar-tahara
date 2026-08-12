#!/usr/bin/env python3
"""
Provision the Dar Tahara referral reward emails and their campaign.

Creates, idempotently (matched by name, skipped if present):
  1. The five reward-state emails, pasted verbatim from deploy/mautic/emails/
     as Custom HTML. The designer's table layout and inline styles are preserved
     byte-for-byte; nothing is rebuilt with builder blocks.
  2. One campaign that branches on verified_referral_count and sends the email
     matching the contact's tier.

The campaign is created UNPUBLISHED on purpose. Publishing it starts sending to
real contacts, which is a human decision — review the branches and run a test
send first (see README "Referral reward emails").

Field notes:
  - The tier is read from `verified_referral_count`, the counter this system has
    always used, NOT a second `referral_count` field. One source of truth.
  - Tiers 6, 7 and 8 deliberately have no email: the handoff defines five states
    (0 / 1-4 / 5 / 9 / 10) and those contacts simply get nothing that week.

Usage:  sudo python3 provision-referral-campaign.py
"""
import base64
import json
import os
import urllib.error
import urllib.request

BASE = os.environ.get("MAUTIC_API_BASE", "https://marketing.saasolution.es")
EMAIL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "emails")

FROM_NAME = "Dar Tahara"
FROM_ADDRESS = "hello@dartahara.com"

# Segment the campaign draws from. Every verified early-access contact is in the
# referral programme, including those still at zero referrals (they get state 1).
SOURCE_SEGMENT_ALIAS = "dt-ea-verified"


def creds():
    with open("/root/mautic-admin-credentials.txt") as f:
        d = dict(
            line.strip().split("=", 1)
            for line in f
            if "=" in line and not line.startswith("#")
        )
    return d["username"], d["password"]


USER, PW = creds()
AUTH = "Basic " + base64.b64encode(f"{USER}:{PW}".encode()).decode()


def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        BASE + path, data=data, method=method,
        headers={"Authorization": AUTH, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "body": e.read().decode()[:400]}


def load(filename):
    with open(os.path.join(EMAIL_DIR, filename), encoding="utf-8") as f:
        return f.read()


# ── The five reward states ────────────────────────────────────────────────────
# `tier` is the branch condition on verified_referral_count.
EMAILS = [
    {
        "name": "Referral — 0 referrals",
        "subject": "Unlock up to 25% off your Smart Lock",
        "file": "email-01-zero-referrals.html",
        "tier": {"operator": "=", "value": "0"},
    },
    {
        "name": "Referral — active (1-4)",
        "subject": "You've unlocked {contactfield=referral_pct}% off your Smart Lock",
        "file": "email-02-active-referral.html",
        "tier": {"operator": "in", "value": "1,2,3,4"},
    },
    {
        "name": "Referral — halfway (5)",
        "subject": "You're halfway to your Smart Lock reward",
        "file": "email-03-halfway.html",
        "tier": {"operator": "=", "value": "5"},
    },
    {
        "name": "Referral — almost max (9)",
        "subject": "Just one more referral",
        "file": "email-04-almost-max.html",
        "tier": {"operator": "=", "value": "9"},
    },
    {
        "name": "Referral — maximum reward (10)",
        "subject": "Maximum reward unlocked — 25% off your Smart Lock",
        # gte, not =: an over-credited contact must still land on the final state
        # rather than falling through every branch and receiving nothing.
        "file": "email-05-maximum-reward.html",
        "tier": {"operator": "gte", "value": "10"},
    },
]

CAMPAIGN_NAME = "DT · Referral reward progress"


def index_by_name(payload, key):
    items = payload.get(key, {}) if isinstance(payload, dict) else {}
    it = items.values() if isinstance(items, dict) else items
    return {i.get("name"): i.get("id") for i in it if isinstance(i, dict)}


def segment_id(alias):
    data = api("GET", "/api/segments?limit=500")
    lists = data.get("lists", {}) if isinstance(data, dict) else {}
    it = lists.values() if isinstance(lists, dict) else lists
    for s in it:
        if s.get("alias") == alias:
            return s.get("id")
    return None


def ensure_emails():
    existing = index_by_name(api("GET", "/api/emails?limit=500"), "emails")
    ids, created, existed, failed = {}, 0, 0, 0
    for e in EMAILS:
        if e["name"] in existing:
            print(f"  = {e['name']} (exists, id {existing[e['name']]})")
            ids[e["name"]] = existing[e["name"]]
            existed += 1
            continue
        body = {
            "name": e["name"],
            "subject": e["subject"],
            "emailType": "template",
            "customHtml": load(e["file"]),
            "isPublished": True,
            "fromName": FROM_NAME,
            "fromAddress": FROM_ADDRESS,
            "replyToAddress": FROM_ADDRESS,
            "language": "en",
        }
        r = api("POST", "/api/emails/new", body)
        if isinstance(r, dict) and "email" in r:
            ids[e["name"]] = r["email"]["id"]
            print(f"  + {e['name']} (id {r['email']['id']})")
            created += 1
        else:
            print(f"  ! {e['name']} FAILED: {r}")
            failed += 1
    return ids, created, existed, failed


def build_campaign(email_ids, seg_id):
    """One condition per tier off the segment source; its `yes` path sends."""
    events, nodes, conns = [], [{"id": "lists", "positionX": "796", "positionY": "40"}], []
    x = 120
    for i, e in enumerate(EMAILS):
        cond_id, send_id = f"new_c{i}", f"new_e{i}"
        events.append({
            "id": cond_id,
            "name": f"Referral count {e['tier']['operator']} {e['tier']['value']}",
            "type": "lead.field_value",
            "eventType": "condition",
            "order": 1,
            "properties": {
                "field": "verified_referral_count",
                "operator": e["tier"]["operator"],
                "value": e["tier"]["value"],
            },
            "triggerMode": "immediate",
            "triggerInterval": 1,
            "triggerIntervalUnit": "d",
            "anchor": "leadsource",
            "parent": None,
        })
        events.append({
            "id": send_id,
            "name": f"Send: {e['name']}",
            "type": "email.send",
            "eventType": "action",
            "order": 2,
            "properties": {"email": email_ids[e["name"]], "email_type": "template", "use_dnc": 1},
            "triggerMode": "immediate",
            "triggerInterval": 1,
            "triggerIntervalUnit": "d",
            "anchor": "yes",
            "decisionPath": "yes",
            "parent": cond_id,
        })
        nodes.append({"id": cond_id, "positionX": str(x), "positionY": "240"})
        nodes.append({"id": send_id, "positionX": str(x), "positionY": "420"})
        conns.append({"sourceId": "lists", "targetId": cond_id,
                      "anchors": {"source": "leadsource", "target": "top"}})
        conns.append({"sourceId": cond_id, "targetId": send_id,
                      "anchors": {"source": "yes", "target": "top"}})
        x += 300

    return {
        "name": CAMPAIGN_NAME,
        "description": (
            "Sends the referral reward email matching the contact's "
            "verified_referral_count (0 / 1-4 / 5 / 9 / 10). Reward field values "
            "and the progress bar are written by the dar-tahara referral-confirmed "
            "sync; this campaign only routes and sends. Left unpublished until "
            "reviewed and test-sent."
        ),
        "isPublished": False,
        "events": events,
        "canvasSettings": {"nodes": nodes, "connections": conns},
        "lists": [{"id": seg_id}],
    }


def main():
    print("==> referral reward emails")
    email_ids, created, existed, failed = ensure_emails()
    if failed:
        print(f"\ncreated: {created}  existed: {existed}  failed: {failed}")
        raise SystemExit(1)

    print("\n==> campaign")
    seg_id = segment_id(SOURCE_SEGMENT_ALIAS)
    if not seg_id:
        print(f"  ! source segment '{SOURCE_SEGMENT_ALIAS}' not found — run provision.sh first")
        raise SystemExit(1)

    if CAMPAIGN_NAME in index_by_name(api("GET", "/api/campaigns?limit=500"), "campaigns"):
        print(f"  = {CAMPAIGN_NAME} (exists)")
    else:
        r = api("POST", "/api/campaigns/new", build_campaign(email_ids, seg_id))
        if isinstance(r, dict) and "campaign" in r:
            print(f"  + {CAMPAIGN_NAME} (id {r['campaign']['id']}, UNPUBLISHED)")
        else:
            print(f"  ! {CAMPAIGN_NAME} FAILED: {r}")
            raise SystemExit(1)

    print(f"\ncreated: {created}  existed: {existed}  failed: {failed}")


if __name__ == "__main__":
    main()
