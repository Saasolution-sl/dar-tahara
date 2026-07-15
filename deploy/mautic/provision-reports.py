#!/usr/bin/env python3
"""
Provision Dar Tahara Mautic reports (Phase 3, brief §30).

Idempotent (matched by name). Run on the VPS. Reports use the `leads` source with
early-access custom-field columns, plus one `email.stats` engagement report. Each
groups the marketing data marketers actually filter on — city, country, source /
UTM, service interest, property type, verification/stage, referrals, access.

Usage:  sudo python3 provision-reports.py
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


def report(name, source, columns, filters=None, description=""):
    return {
        "name": name, "description": description, "source": source,
        "columns": columns, "isPublished": True,
        "filters": filters if filters is not None else [],
    }


REPORTS = [
    report("DT · Early Access — All Contacts", "leads",
           ["l.firstname", "l.lastname", "l.email", "l.cleaning_city",
            "l.early_access_status", "l.lead_score", "l.date_added"],
           description="Master list of early-access contacts."),
    report("DT · By Cleaning City", "leads",
           ["l.cleaning_city", "l.cleaning_region", "l.email", "l.early_access_status", "l.lead_score"],
           description="Interest by Moroccan property city."),
    report("DT · By Residence Country", "leads",
           ["l.country_of_residence", "l.email", "l.early_access_status", "l.preferred_language"],
           description="Where early-access contacts live."),
    report("DT · By Source & UTM", "leads",
           ["l.first_source_code", "l.first_utm_source", "l.first_utm_medium",
            "l.first_utm_campaign", "l.email", "l.early_access_status"],
           description="Which channels and links produced contacts (first-touch)."),
    report("DT · By Service Interest", "leads",
           ["l.desired_services", "l.desired_frequency", "l.expected_start_period",
            "l.email", "l.cleaning_city"],
           description="What services and cadence contacts want."),
    report("DT · By Property Type", "leads",
           ["l.property_type", "l.property_size_range", "l.occupancy_type",
            "l.cleaning_city", "l.email"],
           description="Property mix across contacts."),
    report("DT · Verification & Stage", "leads",
           ["l.email", "l.early_access_status", "l.email_verified", "l.lead_stage", "l.lead_score"],
           description="Verification funnel and lifecycle stage."),
    report("DT · Referrals", "leads",
           ["l.email", "l.referral_code", "l.referred_by_code", "l.verified_referral_count"],
           description="Referrers and referred contacts."),
    report("DT · Access Method", "leads",
           ["l.access_method", "l.has_digital_lock", "l.cleaning_city", "l.email"],
           description="How the team would access each property."),
    report("DT · Email Performance", "email.stats",
           ["es.email_address", "es.date_sent", "es.date_read", "es.is_failed"],
           filters=[],
           description="Sends, reads and failures across emails. Add opens/clicks columns in the UI."),
]


def main():
    existing = api("GET", "/api/reports?limit=200")
    rl = existing.get("reports", {})
    it = rl.values() if isinstance(rl, dict) else rl
    have = {r["name"] for r in it}

    created = existed = failed = 0
    for r in REPORTS:
        if r["name"] in have:
            print(f"  = {r['name']} (exists)"); existed += 1; continue
        resp = api("POST", "/api/reports/new", r)
        if "report" in resp:
            print(f"  + {r['name']} (id {resp['report']['id']})"); created += 1
        else:
            print(f"  ! {r['name']} FAILED: {resp}"); failed += 1

    print(f"\ncreated: {created}  existed: {existed}  failed: {failed}")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
