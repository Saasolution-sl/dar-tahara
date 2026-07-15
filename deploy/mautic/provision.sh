#!/usr/bin/env bash
#
# Provision the Mautic data model for Dar Tahara early access.
#
# Creates, idempotently:
#   1. Custom contact fields  (the marketing-relevant subset — brief §19)
#   2. Tags                   (brief §20)
#   3. Roles                  (brief §4, least-privilege)
#   4. A dedicated API user    used by the Dar Tahara website to sync contacts
#   5. Segments               (brief §21)
#
# Idempotent by design: every object is looked up by its unique key (field alias,
# tag name, role name, segment alias) and skipped if it already exists. Re-running
# after adding a new field to the tables below creates only the new one — which is
# how this stays the source of truth rather than a one-shot.
#
# Runs ON the VPS; talks to Mautic over the container's own loopback, so no
# credential ever crosses the network and this works before DNS/TLS exist.
#
# Usage: sudo /opt/projects/mautic/provision.sh
set -euo pipefail

CRED_FILE=/root/mautic-admin-credentials.txt
API_CRED_FILE=/root/mautic-api-credentials.txt
CONTAINER=mautic-web

[[ $EUID -eq 0 ]] || { echo "must run as root (reads $CRED_FILE)" >&2; exit 1; }

ADMIN_USER="$(sed -n 's/^username=//p' "$CRED_FILE")"
ADMIN_PW="$(sed -n 's/^password=//p' "$CRED_FILE")"

created=0; existed=0; failed=0

# Call the Mautic API from inside the container. JSON is passed via stdin to a
# temp file in the container, which sidesteps all shell-quoting problems.
api() {
  local method="$1" path="$2" body="${3:-}"
  if [[ -n "$body" ]]; then
    printf '%s' "$body" | docker exec -i "$CONTAINER" tee /tmp/payload.json >/dev/null
    docker exec "$CONTAINER" curl -sS -u "${ADMIN_USER}:${ADMIN_PW}" \
      -H 'Content-Type: application/json' -X "$method" \
      -d @/tmp/payload.json "http://127.0.0.1${path}"
  else
    docker exec "$CONTAINER" curl -sS -u "${ADMIN_USER}:${ADMIN_PW}" \
      -H 'Content-Type: application/json' -X "$method" \
      "http://127.0.0.1${path}"
  fi
}

# Treat an "already exists"/duplicate response as success, so a re-run is quiet.
report() {
  local what="$1" resp="$2"
  if grep -q '"errors"' <<<"$resp"; then
    if grep -qiE 'unique|already|must be unique|duplicate' <<<"$resp"; then
      echo "  = ${what} (exists)"; existed=$((existed+1))
    else
      echo "  ! ${what} FAILED: $(head -c 220 <<<"$resp")"; failed=$((failed+1))
    fi
  else
    echo "  + ${what}"; created=$((created+1))
  fi
}

# ── 1. Custom contact fields ──────────────────────────────────────────────────
# Only marketing-relevant data lives in Mautic. Exact addresses, coordinates,
# entry notes and key-handling notes stay in Supabase (brief §19).
#
# Format: alias|Label|type|group[|option1,option2,...]
#   select/multiselect fields must ship their option list or Mautic stores free
#   text and segment filters silently stop matching.
echo "==> contact fields"
FIELDS=(
  # Identity & contact
  "whatsapp_phone|WhatsApp Phone|tel|core"
  "preferred_language|Preferred Language|select|core|en,fr,ar,nl,es,de,pt"
  "preferred_contact_method|Preferred Contact Method|select|core|email,whatsapp,telephone"
  "country_of_residence|Country of Residence|text|core"

  # Billing summary (the full address stays in Supabase)
  "billing_recipient_type|Billing Recipient Type|select|professional|private,business"
  "billing_country|Billing Country|text|professional"
  "billing_city|Billing City|text|professional"

  # Cleaning-property summary
  "cleaning_city|Cleaning City|text|professional"
  "cleaning_region|Cleaning Region|text|professional"
  "cleaning_country|Cleaning Country|text|professional"
  "property_type|Property Type|select|professional|apartment,house,villa,holiday_home,short_term_rental,riad,office,other"
  "property_size_range|Property Size Range|select|professional|under_60,60_100,100_150,150_250,over_250"
  "occupancy_type|Occupancy Type|select|professional|primary_residence,secondary_residence,holiday_home,short_term_rental,long_term_rental,empty"
  "property_condition|Property Condition|select|professional|maintained,standard,empty_a_while,deep_clean,renovation_dust,unsure"

  # Service interest
  "desired_services|Desired Services|multiselect|professional|standard_cleaning,deep_cleaning,recurring_cleaning,holiday_home_prep,arrival_prep,departure_cleaning,airbnb_turnover,move_in,move_out,property_inspection,laundry,linen_change,window_cleaning,fridge_cleaning,oven_cleaning,balcony_terrace,property_care,other"
  "desired_frequency|Desired Frequency|select|professional|one_time,weekly,biweekly,monthly,before_arrival,after_departure,on_demand,not_sure"
  "expected_start_period|Expected Start Period|select|professional|asap,within_1_month,within_3_months,within_6_months,later,no_fixed_date"
  "access_method|Access Method|select|professional|digital_lock,physical_key,person_present,concierge,lockbox,property_manager,other"
  "has_digital_lock|Has Digital Lock|boolean|professional"

  # Campaign / lifecycle
  "early_access_status|Early Access Status|select|core|pending,verified,qualified,waitlisted,invited,customer"
  "email_verified|Email Verified|boolean|core"
  "referral_code|Referral Code|text|core"
  "referred_by_code|Referred By Code|text|core"
  "verified_referral_count|Verified Referral Count|number|core"
  "source_tracking_code|Source Tracking Code|text|core"

  # Attribution. Mautic reserves the bare utm_* aliases for its own native UTM
  # tracking (the utmtags table), so custom contact fields MUST be namespaced.
  # This also matches the brief's requirement to keep first-touch and last-touch
  # separate, and mirrors the Supabase columns first_utm_* / last_utm_*.
  # First-touch is written once at first submission and never overwritten;
  # last-touch is refreshed on every visit (brief §27).
  "first_utm_source|First UTM Source|text|core"
  "first_utm_medium|First UTM Medium|text|core"
  "first_utm_campaign|First UTM Campaign|text|core"
  "first_utm_content|First UTM Content|text|core"
  "first_utm_term|First UTM Term|text|core"
  "last_utm_source|Last UTM Source|text|core"
  "last_utm_medium|Last UTM Medium|text|core"
  "last_utm_campaign|Last UTM Campaign|text|core"
  "last_utm_content|Last UTM Content|text|core"
  "first_source_code|First Source Code|text|core"
  "last_source_code|Last Source Code|text|core"

  # Link back to the system of record.
  "supabase_lead_id|Supabase Lead ID|text|core"
)

for spec in "${FIELDS[@]}"; do
  IFS='|' read -r alias label ftype fgroup opts <<<"$spec"
  props='{}'
  if [[ "$ftype" == "boolean" ]]; then
    # Boolean contact fields REQUIRE yes/no labels or the API rejects them with a
    # confusing "extra fields" error and the field is silently not created.
    props='{"yes":"Yes","no":"No"}'
  elif [[ -n "${opts:-}" ]]; then
    # Build [{"label":"x","value":"x"}, ...] for select/multiselect.
    list=""
    IFS=',' read -ra values <<<"$opts"
    for v in "${values[@]}"; do
      [[ -n "$list" ]] && list+=","
      list+="{\"label\":\"${v}\",\"value\":\"${v}\"}"
    done
    props="{\"list\":[${list}]}"
  fi
  body="{\"label\":\"${label}\",\"alias\":\"${alias}\",\"type\":\"${ftype}\",\"group\":\"${fgroup}\",\"isPublished\":true,\"properties\":${props}}"
  report "field ${alias}" "$(api POST /api/fields/contact/new "$body")"
done

# ── 2. Tags ───────────────────────────────────────────────────────────────────
# Documented naming convention (brief §20): lowercase, hyphenated, prefixed by
# facet (source-, property-, frequency-, access-). Pre-creating them keeps the
# vocabulary controlled instead of letting typos spawn near-duplicate tags.
echo "==> tags"
TAGS=(
  dar-tahara early-access early-access-2026
  verified-lead unverified-lead qualified-lead waitlisted-lead
  source-whatsapp source-facebook source-instagram source-tiktok
  source-telegram source-email source-qr source-partner source-influencer
  property-apartment property-house property-villa property-airbnb
  property-holiday-home property-riad
  frequency-weekly frequency-biweekly frequency-monthly
  frequency-one-time frequency-on-demand
  access-digital-lock access-physical-key access-third-party access-lockbox
)
for tag in "${TAGS[@]}"; do
  report "tag ${tag}" "$(api POST /api/tags/new "{\"tag\":\"${tag}\"}")"
done

# ── 3. Roles ──────────────────────────────────────────────────────────────────
# Least privilege: only the Mautic Administrator role is a true admin. Dar Tahara
# staff get exactly the permissions their job needs — a Reporting-Only user can
# read contacts and reports but cannot email anyone or export data.
#
# Mautic permission bits: 1=view(own) 2=viewother 4=editown 8=editother
# 16=createown/create 32=deleteown 64=deleteother 128=publishown 256=publishother
# 512=full. "full" grants everything for that bundle.
echo "==> roles"
# The roles endpoint returns {"roles":[ ... ]} (a JSON array), so membership is
# tested against the raw body rather than by array-vs-object parsing.
create_role() {
  local name="$1" desc="$2" perms="$3"
  local existing
  existing="$(api GET "/api/roles?limit=200")"
  if grep -qF "\"name\":\"${name}\"" <<<"$existing"; then
    echo "  = role ${name} (exists)"; existed=$((existed+1)); return
  fi
  report "role ${name}" \
    "$(api POST /api/roles/new "{\"name\":\"${name}\",\"description\":\"${desc}\",\"isAdmin\":false,\"rawPermissions\":${perms}}")"
}

# Full administrator (Mautic's own isAdmin flag — bypasses granular perms).
existing_roles="$(api GET '/api/roles?limit=200')"
if grep -qF '"name":"Mautic Administrator"' <<<"$existing_roles"; then
  echo "  = role Mautic Administrator (exists)"; existed=$((existed+1))
else
  report "role Mautic Administrator" \
    "$(api POST /api/roles/new '{"name":"Mautic Administrator","description":"Full system administration. Infrastructure owner only.","isAdmin":true}')"
fi

# Marketing Manager — runs the whole Dar Tahara marketing function, but cannot
# administer users, roles or system config.
create_role "Dar Tahara Marketing Manager" \
  "Full marketing operations: contacts, segments, campaigns, emails, reports. No user/system administration." \
  '{"lead:leads":["full"],"lead:lists":["full"],"lead:imports":["full"],"email:emails":["full"],"campaign:campaigns":["full"],"page:pages":["full"],"form:forms":["full"],"asset:assets":["full"],"point:points":["full"],"point:triggers":["full"],"report:reports":["full"],"stage:stages":["full"]}'

# Campaign Manager — builds and runs campaigns/emails; may read contacts and
# segments but must not delete contacts or edit the segment definitions others rely on.
create_role "Campaign Manager" \
  "Builds and runs campaigns and emails. Read-only on contacts and segments." \
  '{"lead:leads":["viewown","viewother"],"lead:lists":["viewown","viewother"],"email:emails":["full"],"campaign:campaigns":["full"],"page:pages":["viewown","viewother"],"asset:assets":["viewown","viewother"],"report:reports":["viewown","viewother"]}'

# Lead Manager — works the inbound leads (qualify, tag, follow up). Cannot send
# marketing email or change automation.
create_role "Lead Manager" \
  "Works inbound leads: view, edit, qualify, tag. Cannot send marketing email or change automation." \
  '{"lead:leads":["viewown","viewother","editown","editother","create"],"lead:lists":["viewown","viewother"],"report:reports":["viewown","viewother"],"campaign:campaigns":["viewown","viewother"]}'

# Reporting Only — the safe default for anyone who just needs the numbers.
# View-only everywhere; cannot export, email, or edit anything.
create_role "Reporting Only" \
  "Read-only access to contacts, segments, campaigns and reports. Cannot edit, email or export." \
  '{"lead:leads":["viewown","viewother"],"lead:lists":["viewown","viewother"],"email:emails":["viewown","viewother"],"campaign:campaigns":["viewown","viewother"],"report:reports":["viewown","viewother"]}'

# API integration role — the website's sync user. It needs to read and write
# contacts and to read segments, and nothing else. Notably it cannot send email,
# so a leaked API credential cannot be used to mail the contact database.
create_role "Dar Tahara API Integration" \
  "Machine account for the dartahara.com website sync. Contacts read/write + segment read only. Cannot send email." \
  '{"lead:leads":["viewown","viewother","editown","editother","create"],"lead:lists":["viewown","viewother"]}'

# ── 4. API user ───────────────────────────────────────────────────────────────
# The website authenticates as this user, NOT as the admin. Its password is
# generated here and written root-only; it is what goes into MAUTIC_API_PASSWORD
# in the Next.js server env.
echo "==> API user"
# /api/roles returns a list under "roles"; handle both list and dict shapes.
API_ROLE_ID="$(api GET '/api/roles?limit=200' \
  | python3 -c 'import sys,json
d=json.load(sys.stdin); r=d["roles"]; it=r.values() if isinstance(r,dict) else r
print(next((x["id"] for x in it if x["name"]=="Dar Tahara API Integration"),""))' 2>/dev/null || true)"

if [[ -z "${API_ROLE_ID}" ]]; then
  echo "  ! could not resolve the API integration role id — skipping API user"; failed=$((failed+1))
else
  existing_users="$(api GET '/api/users?limit=200')"
  if grep -qF '"username":"dt-api"' <<<"$existing_users"; then
    echo "  = user dt-api (exists)"; existed=$((existed+1))
  else
    API_PW="$(openssl rand -base64 30 | tr -d '/+=' | cut -c1-30)Aa1!"
    body="{\"username\":\"dt-api\",\"firstName\":\"Dar Tahara\",\"lastName\":\"API\",\"email\":\"api@dartahara.com\",\"plainPassword\":{\"password\":\"${API_PW}\",\"confirm\":\"${API_PW}\"},\"role\":${API_ROLE_ID}}"
    resp="$(api POST /api/users/new "$body")"
    report "user dt-api" "$resp"
    if ! grep -q '"errors"' <<<"$resp"; then
      umask 077
      cat > "$API_CRED_FILE" <<CRED
# Mautic API user for the dartahara.com website — generated $(date -u +%FT%TZ).
# These are the values for MAUTIC_API_USERNAME / MAUTIC_API_PASSWORD.
MAUTIC_BASE_URL=https://marketing.saasolution.es
MAUTIC_API_USERNAME=dt-api
MAUTIC_API_PASSWORD=${API_PW}
CRED
      chmod 600 "$API_CRED_FILE"
      echo "    credentials written to ${API_CRED_FILE}"
    fi
  fi
fi

# ── 5. Segments ───────────────────────────────────────────────────────────────
# Dynamic segments: membership is recomputed by `mautic:segments:update` (cron),
# never maintained by hand.
#
# Format: alias|Name|filters-json
echo "==> segments"

# Build a tag-name → tag-id map once. The tags segment filter is a Symfony
# ChoiceType whose valid values are tag IDs, not the tag strings — passing the
# string fails NotBlank validation with a misleading "A value is required".
declare -A TAG_ID
while IFS=$'\t' read -r tid tname; do
  [[ -n "$tname" ]] && TAG_ID["$tname"]="$tid"
done < <(api GET '/api/tags?limit=500' | python3 -c 'import sys,json
d=json.load(sys.stdin); t=d["tags"]; it=t.values() if isinstance(t,dict) else t
for x in it: print(str(x["id"]) + "\t" + x["tag"])')

# tags: value is the tag ID; filter lives at the top level with a display key.
f_tag()  {
  local id="${TAG_ID[$1]:-}"
  [[ -n "$id" ]] || { echo "MISSING_TAG_$1" >&2; return; }
  printf '{"glue":"and","field":"tags","object":"lead","type":"tags","operator":"in","filter":["%s"],"display":""}' "$id"
}
# text/select: Mautic accepts the value under properties.filter (verified to
# persist and match), so this shape is kept as-is.
f_eq()   { printf '{"glue":"and","field":"%s","object":"lead","type":"%s","operator":"=","properties":{"filter":"%s"}}' "$1" "${3:-text}" "$2"; }
# boolean: value must be top-level filter ("1"/"0"), never under properties.
f_bool() { printf '{"glue":"and","field":"%s","object":"lead","type":"boolean","operator":"=","filter":"%s","display":""}' "$1" "$2"; }

SEGMENTS=(
  "dt-early-access-all|Dar Tahara Early Access — All|[$(f_tag early-access)]"
  "dt-ea-pending|Dar Tahara Early Access — Pending Verification|[$(f_tag early-access),$(f_eq early_access_status pending select)]"
  "dt-ea-verified|Dar Tahara Early Access — Verified|[$(f_tag early-access),$(f_bool email_verified 1)]"
  "dt-ea-qualified|Dar Tahara Early Access — Qualified|[$(f_tag early-access),$(f_eq early_access_status qualified select)]"
  "dt-ea-waitlisted|Dar Tahara Early Access — Waitlisted|[$(f_tag early-access),$(f_eq early_access_status waitlisted select)]"

  # Residence
  "dt-res-nl|Residents — Netherlands|[$(f_eq country_of_residence NL)]"
  "dt-res-be|Residents — Belgium|[$(f_eq country_of_residence BE)]"
  "dt-res-fr|Residents — France|[$(f_eq country_of_residence FR)]"
  "dt-res-de|Residents — Germany|[$(f_eq country_of_residence DE)]"
  "dt-res-es|Residents — Spain|[$(f_eq country_of_residence ES)]"
  "dt-res-gb|Residents — United Kingdom|[$(f_eq country_of_residence GB)]"
  "dt-res-ae|Residents — UAE|[$(f_eq country_of_residence AE)]"
  "dt-res-ma|Residents — Morocco|[$(f_eq country_of_residence MA)]"

  # Cleaning city
  "dt-city-tangier|Property — Tangier|[$(f_eq cleaning_city Tangier)]"
  "dt-city-tetouan|Property — Tetouan|[$(f_eq cleaning_city Tetouan)]"
  "dt-city-fnideq|Property — Fnideq|[$(f_eq cleaning_city Fnideq)]"
  "dt-city-casablanca|Property — Casablanca|[$(f_eq cleaning_city Casablanca)]"
  "dt-city-rabat|Property — Rabat|[$(f_eq cleaning_city Rabat)]"
  "dt-city-marrakech|Property — Marrakech|[$(f_eq cleaning_city Marrakech)]"

  # Language
  "dt-lang-en|Language — English|[$(f_eq preferred_language en select)]"
  "dt-lang-fr|Language — French|[$(f_eq preferred_language fr select)]"
  "dt-lang-ar|Language — Arabic|[$(f_eq preferred_language ar select)]"
  "dt-lang-nl|Language — Dutch|[$(f_eq preferred_language nl select)]"
  "dt-lang-es|Language — Spanish|[$(f_eq preferred_language es select)]"
  "dt-lang-de|Language — German|[$(f_eq preferred_language de select)]"
  "dt-lang-pt|Language — Portuguese|[$(f_eq preferred_language pt select)]"

  # Service interest / frequency
  "dt-freq-weekly|Interest — Weekly Cleaning|[$(f_eq desired_frequency weekly select)]"
  "dt-freq-biweekly|Interest — Biweekly Cleaning|[$(f_eq desired_frequency biweekly select)]"
  "dt-freq-monthly|Interest — Monthly Cleaning|[$(f_eq desired_frequency monthly select)]"

  # Access
  "dt-access-digital|Access — Digital Lock|[$(f_eq access_method digital_lock select)]"
  "dt-access-key|Access — Physical Key|[$(f_eq access_method physical_key select)]"

  # High intent
  "dt-start-1m|Start Within One Month|[$(f_eq expected_start_period within_1_month select)]"
  "dt-start-3m|Start Within Three Months|[$(f_eq expected_start_period within_3_months select)]"
  "dt-high-intent|Verified High-Intent Leads|[$(f_bool email_verified 1),$(f_eq expected_start_period within_1_month select)]"

  # Referral
  "dt-referred|Referred Leads|[{\"glue\":\"and\",\"field\":\"referred_by_code\",\"object\":\"lead\",\"type\":\"text\",\"operator\":\"!empty\",\"properties\":{\"filter\":\"\"}}]"
)

for spec in "${SEGMENTS[@]}"; do
  IFS='|' read -r alias name filters <<<"$spec"
  # A failed tag lookup leaves a MISSING_TAG_ marker or an empty filter slot in
  # the JSON. Refuse to publish such a segment: an empty filter set silently
  # matches EVERY contact, which is far more dangerous than a visible failure.
  if [[ "$filters" == *MISSING_TAG_* || "$filters" == *",]"* || "$filters" == *"[,"* ]]; then
    echo "  ! segment ${alias} SKIPPED: unresolved tag in filter"; failed=$((failed+1)); continue
  fi
  body="{\"name\":\"${name}\",\"alias\":\"${alias}\",\"isPublished\":true,\"filters\":${filters}}"
  report "segment ${alias}" "$(api POST /api/segments/new "$body")"
done

docker exec "$CONTAINER" rm -f /tmp/payload.json 2>/dev/null || true

echo
echo "──────────────────────────────────────────"
echo "created: ${created}   already existed: ${existed}   failed: ${failed}"
[[ "${failed}" -eq 0 ]] || exit 1
