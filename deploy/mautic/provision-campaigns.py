#!/usr/bin/env python3
"""
Provision the Dar Tahara automation campaigns in Mautic (Phase 3, brief §24).

Idempotent: campaigns are matched by name and skipped if present. Segments and
emails must already exist (provision.sh + provision-emails.py). Run on the VPS.

Campaigns (source segment → actions):
  1. Pending Verification  (dt-ea-pending)  → reminder @1d, final reminder @4d
  2. Verified Welcome      (dt-ea-verified) → welcome email + swap verification tags
  3. High-Intent Follow-Up (dt-high-intent) → follow-up email + qualified-lead tag
  4. Referral Milestone    (referrers 1+)   → milestone email
  5. City Launch — Tangier (dt-city-tangier)→ city-launch email  (clone per city)
  6. Re-engagement         (dt-ea-verified) → re-engagement email @60d

Every action is anchored to the segment source (leadsource) with a trigger
interval, which keeps the event graph flat and reliable to create over the API.
Campaigns are created UNPUBLISHED so a human reviews them before they send.

Usage:  sudo python3 provision-campaigns.py
"""
import json, base64, urllib.request, urllib.error

BASE = "https://marketing.saasolution.es"
d = dict(
    l.strip().split("=", 1)
    for l in open("/root/mautic-admin-credentials.txt")
    if "=" in l and not l.startswith("#")
)
AUTH = "Basic " + base64.b64encode(f"{d['username']}:{d['password']}".encode()).decode()


def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        BASE + path, data=data, method=method,
        headers={"Authorization": AUTH, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"HTTP": e.code, "body": e.read().decode()[:300]}


def segment_id(alias, create=None):
    r = api("GET", "/api/segments?limit=300")
    lists = r.get("lists", {})
    it = lists.values() if isinstance(lists, dict) else lists
    for s in it:
        if s["alias"] == alias:
            return s["id"]
    if create:
        r = api("POST", "/api/segments/new", create)
        return r["list"]["id"] if "list" in r else None
    return None


def email_ids():
    r = api("GET", "/api/emails?limit=100")
    e = r.get("emails", {})
    it = e.values() if isinstance(e, dict) else e
    return {x["name"]: x["id"] for x in it}


def send(email_id, name, mode="immediate", interval=1, unit="d", eid="new_1"):
    return {
        "id": eid, "name": name, "type": "email.send", "eventType": "action", "order": 1,
        "properties": {"email": email_id, "email_type": "template", "use_dnc": 1},
        "triggerMode": mode, "triggerInterval": interval, "triggerIntervalUnit": unit,
        "anchor": "leadsource", "parent": None,
    }


def tags(name, add=None, remove=None, eid="new_2"):
    return {
        "id": eid, "name": name, "type": "lead.changetags", "eventType": "action", "order": 2,
        "properties": {"add_tags": add or [], "remove_tags": remove or []},
        "triggerMode": "immediate", "triggerInterval": 1, "triggerIntervalUnit": "d",
        "anchor": "leadsource", "parent": None,
    }


def canvas(events):
    """All events hang off the segment source (flat graph)."""
    nodes = [{"id": "lists", "positionX": "796", "positionY": "50"}]
    conns = []
    x = 560
    for e in events:
        nodes.append({"id": e["id"], "positionX": str(x), "positionY": "230"})
        conns.append({"sourceId": "lists", "targetId": e["id"],
                      "anchors": {"source": "leadsource", "target": "top"}})
        x += 240
    return {"nodes": nodes, "connections": conns}


def build(name, description, seg_id, events):
    return {
        "name": name, "description": description, "isPublished": False,
        "events": events, "canvasSettings": canvas(events),
        "lists": [{"id": seg_id}],
    }


def main():
    E = email_ids()
    e = lambda n: E["DT · " + n]

    seg = {
        "pending": segment_id("dt-ea-pending"),
        "verified": segment_id("dt-ea-verified"),
        "high": segment_id("dt-high-intent"),
        "tangier": segment_id("dt-city-tangier"),
    }
    # Create the "Referrers — 1+ Verified" segment if missing.
    seg["referrers"] = segment_id("dt-referrers-1", create={
        "name": "Referrers — 1 Verified Referral", "alias": "dt-referrers-1",
        "isPublished": True,
        "filters": [{
            "glue": "and", "field": "verified_referral_count", "object": "lead",
            "type": "number", "operator": "gte", "filter": "1", "display": "",
        }],
    })

    campaigns = [
        build("DT · Pending Verification",
              "Reminds unverified early-access leads to confirm their email.",
              seg["pending"], [
                  send(e("Verification reminder"), "Reminder @ 24h", "interval", 1, "d", "new_1"),
                  send(e("Verification final reminder"), "Final reminder @ 4d", "interval", 4, "d", "new_2"),
              ]),
        build("DT · Verified Welcome",
              "Welcomes verified leads and swaps the verification tags.",
              seg["verified"], [
                  send(e("Verified welcome"), "Send welcome", "immediate", 1, "d", "new_1"),
                  tags("Swap verification tags", add=["verified-lead"], remove=["unverified-lead"], eid="new_2"),
              ]),
        build("DT · High-Intent Follow-Up",
              "Follows up with verified high-intent leads and tags them qualified.",
              seg["high"], [
                  send(e("High-intent follow-up"), "Send follow-up", "immediate", 1, "d", "new_1"),
                  tags("Tag qualified", add=["qualified-lead"], eid="new_2"),
              ]),
        build("DT · Referral Milestone",
              "Thanks referrers once they have a verified referral.",
              seg["referrers"], [
                  send(e("Referral milestone"), "Send milestone", "immediate", 1, "d", "new_1"),
              ]),
        build("DT · City Launch — Tangier",
              "Announces launch to leads with a property in Tangier. Clone per city.",
              seg["tangier"], [
                  send(e("City launch announcement"), "Send city launch", "immediate", 1, "d", "new_1"),
              ]),
        build("DT · Re-engagement",
              "Re-engages verified leads after a quiet period.",
              seg["verified"], [
                  send(e("Re-engagement"), "Re-engage @ 60d", "interval", 60, "d", "new_1"),
              ]),
    ]

    existing = api("GET", "/api/campaigns?limit=200")
    cl = existing.get("campaigns", {})
    it = cl.values() if isinstance(cl, dict) else cl
    have = {c["name"] for c in it}

    created = existed = failed = 0
    for c in campaigns:
        if c["name"] in have:
            print(f"  = {c['name']} (exists)"); existed += 1; continue
        if not c["lists"][0]["id"]:
            print(f"  ! {c['name']} SKIPPED (source segment missing)"); failed += 1; continue
        r = api("POST", "/api/campaigns/new", c)
        if "campaign" in r:
            print(f"  + {c['name']} (id {r['campaign']['id']}, {len(r['campaign'].get('events',[]))} events)")
            created += 1
        else:
            print(f"  ! {c['name']} FAILED: {r}"); failed += 1

    print(f"\ncreated: {created}  existed: {existed}  failed: {failed}")
    print("NOTE: campaigns are UNPUBLISHED — review + publish in the Mautic UI.")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
