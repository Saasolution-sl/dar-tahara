#!/usr/bin/env python3
"""
Provision Dar Tahara-branded Mautic campaign emails (Phase 3, brief §25).

Idempotent: emails are matched by name and skipped if they already exist. Run on
the VPS (talks to the Mautic API over the public https URL). Creates the emails
the automation campaigns send — verification reminders, the verified welcome,
referral milestone, city launch, high-intent follow-up, re-engagement, preference
update and unsubscribe confirmation.

These are the ENGLISH masters. Mautic language variants can be added later as
translations of each (Email → Translations), or via dynamic content keyed on the
contact's preferred_language field; the HTML + tokens below are the template.

The verification and first welcome emails are sent by the Dar Tahara app itself
(Phase 2), so they are intentionally not duplicated here.

Usage:  sudo python3 provision-emails.py
"""
import json
import subprocess
import urllib.request
import urllib.error

BASE = "https://marketing.saasolution.es"


def creds():
    with open("/root/mautic-admin-credentials.txt") as f:
        d = dict(
            line.strip().split("=", 1)
            for line in f
            if "=" in line and not line.startswith("#")
        )
    return d["username"], d["password"]


USER, PW = creds()
import base64

AUTH = "Basic " + base64.b64encode(f"{USER}:{PW}".encode()).decode()


def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        BASE + path, data=data, method=method,
        headers={"Authorization": AUTH, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "body": e.read().decode()[:200]}


# ── Branded HTML shell ─────────────────────────────────────────────────────────
# Matches the Dar Tahara app email style: forest green + cream + gold. Tokens:
#   {contactfield=firstname} {contactfield=cleaning_city} {contactfield=referral_code}
#   {unsubscribe_text} {webview_text}
def shell(heading, body_html, cta_text=None, cta_url=None, note=None):
    cta = ""
    if cta_text and cta_url:
        cta = (
            f'<a href="{cta_url}" style="display:inline-block;margin:22px 0;'
            f'background:#2f4a29;color:#faf8f3;text-decoration:none;padding:13px 26px;'
            f'border-radius:999px;font-size:15px;font-weight:600;">{cta_text}</a>'
        )
    note_html = (
        f'<p style="font-size:13px;line-height:1.6;color:#7a6a55;background:#f5efe2;'
        f'border-radius:10px;padding:12px 14px;">{note}</p>' if note else ""
    )
    return f"""<!doctype html><html><body style="margin:0;background:#faf8f3;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#26241f;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:8px;font-size:12px;color:#9c8562;">{{webview_text}}</div>
    <div style="background:#fff;border:1px solid #e8e0d0;border-radius:16px;padding:34px;">
      <div style="font-size:20px;font-weight:700;color:#2f4a29;letter-spacing:.3px;">Dar Tahara</div>
      <div style="height:3px;width:44px;background:#d4a843;border-radius:2px;margin:14px 0 22px;"></div>
      <h1 style="font-size:23px;line-height:1.25;margin:0 0 12px;color:#26241f;">{heading}</h1>
      {body_html}
      {cta}
      {note_html}
    </div>
    <p style="text-align:center;font-size:12px;color:#9c8562;margin-top:18px;line-height:1.7;">
      Dar Tahara — House of Purity · Morocco<br>
      <a href="https://dartahara.com/en/privacy" style="color:#9c8562;">Privacy</a> ·
      {{unsubscribe_text}}
    </p>
  </div>
</body></html>"""


def p(text):
    return f'<p style="font-size:15px;line-height:1.7;color:#574a3c;margin:0 0 14px;">{text}</p>'


REF_LINK = "https://dartahara.com/en/early-access?ref={contactfield=referral_code}"

# ── Email definitions ──────────────────────────────────────────────────────────
EMAILS = [
    {
        "name": "DT · Verification reminder",
        "subject": "One step left, {contactfield=firstname}",
        "html": shell(
            "Just one step to secure your place",
            p("Hi {contactfield=firstname}, thanks again for requesting early access to Dar Tahara home care.")
            + p("We haven't been able to confirm your email yet. Please confirm it so we can keep you updated and let you know the moment service opens in your area."),
            "Confirm my email", "https://dartahara.com/en/early-access/success?status=pending",
        ),
    },
    {
        "name": "DT · Verification final reminder",
        "subject": "Last reminder to confirm your early-access request",
        "html": shell(
            "This is our last reminder",
            p("Hi {contactfield=firstname}, your early-access request is almost complete.")
            + p("If you'd still like priority access to Dar Tahara home care and property care in Morocco, please confirm your email. We won't send further reminders."),
            "Confirm my email", "https://dartahara.com/en/early-access/success?status=pending",
        ),
    },
    {
        "name": "DT · Verified welcome",
        "subject": "You're on the Dar Tahara early-access list 🎉",
        "html": shell(
            "Welcome to early access, {contactfield=firstname}",
            p("Your email is confirmed and you're on the Dar Tahara early-access list. We'll contact you when service becomes available for your property in {contactfield=cleaning_city}.")
            + p("This is not a confirmed booking — it's your place in line. As we open your area, you'll be among the first we reach out to.")
            + p("<strong>Invite friends and family.</strong> Share your personal invitation link — it helps us bring Dar Tahara to your city sooner."),
            "Open my referral tools", REF_LINK,
            note="Registration is an early-access request, not a confirmed appointment.",
        ),
    },
    {
        "name": "DT · Referral milestone",
        "subject": "Thank you for spreading the word, {contactfield=firstname}",
        "html": shell(
            "Your invitations are making a difference",
            p("Hi {contactfield=firstname}, thank you for inviting others to Dar Tahara early access — your referrals help us prioritise where to launch first.")
            + p("Keep sharing your personal link with friends and family who own or manage a home in Morocco."),
            "Share again", REF_LINK,
            note="Any rewards will be confirmed to you directly when they become available.",
        ),
    },
    {
        "name": "DT · City launch announcement",
        "subject": "Dar Tahara is coming to {contactfield=cleaning_city}",
        "html": shell(
            "We're launching in {contactfield=cleaning_city}",
            p("Great news, {contactfield=firstname}. Dar Tahara home cleaning and property care is becoming available in {contactfield=cleaning_city}.")
            + p("As an early-access member, you're invited to be among the first to arrange service for your property."),
            "See what's available", "https://dartahara.com/en",
        ),
    },
    {
        "name": "DT · High-intent follow-up",
        "subject": "A personal note about your property in {contactfield=cleaning_city}",
        "html": shell(
            "Let's help you get ready",
            p("Hi {contactfield=firstname}, thank you for the detail you shared about your property in {contactfield=cleaning_city}.")
            + p("Because you're looking to start soon, a member of the Dar Tahara team would like to make sure we're ready for you the moment we open your area. We'll be in touch shortly — feel free to reply to this email with any questions."),
        ),
    },
    {
        "name": "DT · Re-engagement",
        "subject": "Still thinking about home care in Morocco?",
        "html": shell(
            "We're still here for your home",
            p("Hi {contactfield=firstname}, it's been a little while. We're continuing to expand Dar Tahara across Morocco and wanted to check in.")
            + p("If your property or service needs have changed, you can update your preferences any time so we reach you with the right information."),
            "Update my preferences", "https://dartahara.com/en/early-access",
        ),
    },
    {
        "name": "DT · Preference update",
        "subject": "Update your Dar Tahara preferences",
        "html": shell(
            "Keep your details up to date",
            p("Hi {contactfield=firstname}, you can update your property details, service interests and contact preferences whenever you like.")
            + p("Keeping these current helps us reach you with relevant updates as we open new areas."),
            "Update my preferences", "https://dartahara.com/en/early-access",
        ),
    },
    {
        "name": "DT · Unsubscribe confirmation",
        "subject": "You've been unsubscribed from Dar Tahara marketing",
        "html": shell(
            "You're unsubscribed",
            p("Hi {contactfield=firstname}, you've been removed from Dar Tahara marketing emails and won't receive further marketing updates from us.")
            + p("You may still receive essential messages about an active early-access request. If this was a mistake, you can rejoin any time."),
            "Rejoin early access", "https://dartahara.com/en/early-access",
        ),
    },
]


def main():
    existing = api("GET", "/api/emails?limit=500")
    names = set()
    if isinstance(existing, dict) and "emails" in existing:
        emails = existing["emails"]
        it = emails.values() if isinstance(emails, dict) else emails
        names = {e.get("name") for e in it}

    created = existed = failed = 0
    for e in EMAILS:
        if e["name"] in names:
            print(f"  = {e['name']} (exists)")
            existed += 1
            continue
        body = {
            "name": e["name"],
            "subject": e["subject"],
            "emailType": "template",
            "customHtml": e["html"],
            "isPublished": True,
            "fromName": "Dar Tahara",
            "fromAddress": "hello@dartahara.com",
            "replyToAddress": "hello@dartahara.com",
            "language": "en",
        }
        r = api("POST", "/api/emails/new", body)
        if isinstance(r, dict) and "email" in r:
            print(f"  + {e['name']} (id {r['email']['id']})")
            created += 1
        else:
            print(f"  ! {e['name']} FAILED: {r}")
            failed += 1

    print(f"\ncreated: {created}  existed: {existed}  failed: {failed}")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
