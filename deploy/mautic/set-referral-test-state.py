#!/usr/bin/env python3
"""
Flip a test contact through the five referral reward states, so each email can be
previewed and test-sent with realistic values.

Mautic upserts contacts by email, so one address can only hold one state at a
time. Rather than five throwaway addresses (which cannot receive anything), this
sets one real test address to whichever state you want to look at, then you
preview or test-send that state and move on.

    sudo python3 set-referral-test-state.py you@example.com 3
    sudo python3 set-referral-test-state.py you@example.com 0,1,5,9,10   # each in turn

The reward arithmetic mirrors src/lib/early-access/referral-rewards.ts, which is
the authority and is unit-tested (referral-rewards.test.ts asserts the generated
bar is byte-identical to the designer's static cells). This is a test harness
only — production values are always written by the app, never by this script.
"""
import base64
import json
import sys
import urllib.error
import urllib.request

BASE = "https://marketing.saasolution.es"
SITE = "https://www.dartahara.com"
MAX_REFERRALS = 10
FILLED, EMPTY = "#b68235", "#eae7e7"


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


def bar(count):
    cell = '<td style="height:8px;background-color:{};border-left:2px solid #ffffff"></td>'
    return cell.format(FILLED) * count + cell.format(EMPTY) * (MAX_REFERRALS - count)


def fields_for(count, locale="en", code="TESTCODE"):
    count = max(0, min(int(count), MAX_REFERRALS))
    pct = count * 2.5
    return {
        "verified_referral_count": count,
        "referral_pct": pct,
        "referral_saving": round(pct / 100 * 200),
        "referral_next_pct": min(count + 1, MAX_REFERRALS) * 2.5,
        "referral_link": f"{SITE}/{locale}/early-access?ref={code}",
        "referral_progress_html": bar(count),
        "referral_code": code,
    }


def find_contact(email):
    r = api("GET", f"/api/contacts?search=email:{email}&limit=1&minimal=true")
    contacts = r.get("contacts", {}) if isinstance(r, dict) else {}
    it = list(contacts.values()) if isinstance(contacts, dict) else contacts
    return it[0]["id"] if it else None


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        raise SystemExit(2)
    email, states = sys.argv[1], [s.strip() for s in sys.argv[2].split(",") if s.strip()]

    cid = find_contact(email)
    for state in states:
        payload = fields_for(state)
        if cid:
            r = api("PATCH", f"/api/contacts/{cid}/edit", payload)
        else:
            # Tagged so a test contact is never mistaken for a real lead.
            r = api("POST", "/api/contacts/new",
                    {**payload, "email": email, "firstname": "Referral", "lastname": "Test",
                     "tags": "test-contact", "preferred_language": "en"})
        if not isinstance(r, dict) or "contact" not in r:
            print(f"  ! state {state} FAILED: {r}")
            raise SystemExit(1)
        cid = r["contact"]["id"]
        print(f"  + contact {cid} ({email}) set to {state} referrals "
              f"→ {payload['referral_pct']}% off, €{payload['referral_saving']} saved")
        if len(states) > 1:
            input("      preview/test-send this state in Mautic, then press Enter for the next…")


if __name__ == "__main__":
    main()
