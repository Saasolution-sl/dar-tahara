# Mautic contact forensic investigation

Investigation time: 2026-08-08 22:28-22:41 UTC  
Investigated range: 2026-07-08 00:00:00 through 2026-08-08 23:59:59  
Mode: read only. No contacts, cache entries, configuration, logs, or database rows were changed.

## 1. Executive summary

The contacts are in the database. The discrepancy has two independent causes:

1. **Mautic currently has 260 rows in `leads`, of which 259 are anonymous visitors.** The Contacts screen deliberately appends `!is:anonymous` unless the user explicitly asks to show anonymous contacts. Therefore the normal Contacts list shows only the one identified contact, ID `157`.
2. **Eight identified/API contacts were physically deleted by administrators.** Mautic's audit log and Apache access log identify the deleted IDs and the exact API/UI delete actions. They were not merged, soft-deleted, made inactive, or removed by cron.

The current dashboard graph is not reading a statistics/event table. Its plotted values come directly from `leads.date_added`. Summing the current daily values for the selected period gives **260**, exactly equal to the current `leads` row count.

Mautic's shipped default dashboard has a configuration mismatch: the JSON asset and the two installed widget rows store `lists=identifiedVsAnonymous`, while the Mautic 7.1.3 runtime checks `params.flag`. Because `flag` is absent, the widget falls through to **All contacts**, including anonymous visitors. This is why a widget apparently configured for identified-versus-anonymous contacts renders the all-contact spikes.

The historical audit log contains **268 lead-create events**: 259 anonymous tracker-created rows and 9 Dar Tahara API-created rows. Eight of the nine API rows were later manually deleted, leaving 260 current rows. There are no merge records, imports, native Mautic forms, current duplicate emails, inactive contacts, soft-delete columns, or relevant orphan rows.

The 259 anonymous contacts split exactly into:

- **126 Dar Tahara website visitors**, backed by 152 page hits whose URL host is `www.dartahara.com`.
- **133 scanner/bot visitors to the public Mautic host**, backed by 342 page hits whose URL host is `marketing.saasolution.es`. Of those hits, 277 are explicit credential, environment, CMS, debug, or configuration probes.

The answer to “Where are these contacts?” is therefore:

- 259 are anonymous visitor rows hidden by the Contacts screen;
- 1 is the identified contact currently visible (ID `157`);
- 8 additional identified/API rows existed historically but were manually deleted.

## 2. Environment

| Item | Observed value |
|---|---|
| Mautic | 7.1.3, `app/prod`, debug false |
| Image | `mautic/mautic:7.1.3-apache` |
| PHP | 8.3.32 |
| Database | MariaDB 11.4.11 |
| Install path | `/opt/projects/mautic` on host; `/var/www/html` in containers |
| Database name | `mautic` |
| Table prefix | none (`db_table_prefix = NULL`) |
| Contact table | `leads` |
| Host timezone | UTC |
| Database system/global/session timezone | UTC / `SYSTEM` / `SYSTEM` (UTC) |
| PHP/application timezone | `Europe/Madrid` |
| Admin user timezones | `Africa/Ceuta` (`o.deraz`), `Europe/Amsterdam` (`y.amaach`) |
| Public URL | `https://marketing.saasolution.es` |
| Proxy | Caddy -> `mautic-web:80` |
| Containers | `mautic-web`, `mautic-db`, `mautic-cron`, `mautic-worker` |
| Cache | Mautic database cache table plus Symfony compiled filesystem cache; no Redis in this stack |

The database stores the investigated timestamps in UTC. For this daily dashboard range, Mautic groups `date_added` directly by database calendar day. The two relevant user timezones were UTC+2 during the period, so events around midnight can appear on an adjacent local calendar day when compared with external systems.

## 3. Current and historical contact totals

| Measure | Count |
|---|---:|
| Current `leads` rows | 260 |
| Current rows in the investigated range | 260 |
| Historical `lead/create` audit events | 268 |
| Current identified contacts (`date_identified IS NOT NULL`) | 1 |
| Current anonymous contacts (`date_identified IS NULL`) | 259 |
| Current contacts with email | 1 |
| Current contacts without email | 259 |
| Current contacts with meaningful identity fields | 1 |
| Current contacts with no meaningful identity fields | 259 |
| Current contacts associated with an IP | 259 |
| Current contacts associated with a page hit | 259 |
| Current inactive contacts (`is_published = 0`) | 0 |
| Soft-deleted contacts | not supported by this `leads` schema |
| Merge records | 0 |
| Current duplicate non-empty email groups | 0 |
| Native Mautic forms | 0 |
| Native Mautic form submissions | 0 |
| Imports | 0 |

The `leads` table has no `deleted`, `deleted_at`, or archive column. A Mautic delete physically removes the lead row and creates a durable `audit_log` delete entry.

## 4. Daily contact evidence

`Historical creates` comes from `audit_log`. `Current rows` is what the dashboard query can count now. `Deleted later` is assigned to the original creation date of the missing contact, not the deletion date.

| Date (UTC DB day) | Historical creates | Current rows / dashboard | With email | Without email | Anonymous/incomplete | Deleted later | Visible in default Contacts UI |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2026-07-15 | 25 | 21 | 0 | 21 | 21 | 4 | 0 |
| 2026-07-16 | 69 | 69 | 0 | 69 | 69 | 0 | 0 |
| 2026-07-18 | 5 | 5 | 0 | 5 | 5 | 0 | 0 |
| 2026-07-19 | 8 | 8 | 0 | 8 | 8 | 0 | 0 |
| 2026-07-20 | 4 | 4 | 0 | 4 | 4 | 0 | 0 |
| 2026-07-22 | 6 | 6 | 0 | 6 | 6 | 0 | 0 |
| 2026-07-23 | 51 | 51 | 1 | 50 | 50 | 0 | 1 |
| 2026-07-24 | 12 | 12 | 0 | 12 | 12 | 0 | 0 |
| 2026-07-25 | 4 | 3 | 0 | 3 | 3 | 1 | 0 |
| 2026-07-26 | 16 | 15 | 0 | 15 | 15 | 1 | 0 |
| 2026-07-27 | 3 | 3 | 0 | 3 | 3 | 0 | 0 |
| 2026-07-29 | 8 | 8 | 0 | 8 | 8 | 0 | 0 |
| 2026-07-30 | 21 | 21 | 0 | 21 | 21 | 0 | 0 |
| 2026-07-31 | 5 | 5 | 0 | 5 | 5 | 0 | 0 |
| 2026-08-01 | 2 | 1 | 0 | 1 | 1 | 1 | 0 |
| 2026-08-02 | 1 | 1 | 0 | 1 | 1 | 0 | 0 |
| 2026-08-03 | 16 | 16 | 0 | 16 | 16 | 0 | 0 |
| 2026-08-04 | 1 | 1 | 0 | 1 | 1 | 0 | 0 |
| 2026-08-05 | 2 | 1 | 0 | 1 | 1 | 1 | 0 |
| 2026-08-06 | 2 | 2 | 0 | 2 | 2 | 0 | 0 |
| 2026-08-07 | 4 | 4 | 0 | 4 | 4 | 0 | 0 |
| 2026-08-08 | 3 | 3 | 0 | 3 | 3 | 0 | 0 |
| **Total** | **268** | **260** | **1** | **259** | **259** | **8** | **1** |

There were no rows on 2026-07-08 through 2026-07-14, 2026-07-17, 2026-07-21, or 2026-07-28.

### Date-modified grouping

The current rows with a non-null `date_modified`, grouped by UTC day, are:

| Date | Modified rows |
|---|---:|
| 2026-07-15 | 6 |
| 2026-07-16 | 6 |
| 2026-07-18 | 1 |
| 2026-07-19 | 7 |
| 2026-07-20 | 3 |
| 2026-07-22 | 6 |
| 2026-07-23 | 38 |
| 2026-07-24 | 12 |
| 2026-07-25 | 3 |
| 2026-07-26 | 15 |
| 2026-07-27 | 2 |
| 2026-07-29 | 5 |
| 2026-07-30 | 5 |
| 2026-07-31 | 5 |
| 2026-08-01 | 1 |
| 2026-08-02 | 1 |
| 2026-08-04 | 1 |
| 2026-08-05 | 1 |
| 2026-08-06 | 2 |
| 2026-08-07 | 4 |
| 2026-08-08 | 3 |

This does not drive the dashboard widget; the widget uses `date_added` only.

## 5. Why the Contacts screen hides the rows

Mautic 7.1.3's `LeadController::indexAction()` reads any remembered user search from `mautic.lead.filter`, then forcibly appends `!is:anonymous` unless the view/search explicitly requests anonymous contacts:

```php
if ('list' != $indexMode || ('list' == $indexMode && !str_contains($search, $anonymous))) {
    $filter['force'] .= " !$anonymous";
}
```

Source: `/var/www/html/docroot/app/bundles/LeadBundle/Controller/LeadController.php`, lines 107-136 in the running image.

The live session that had used the Contacts list contained:

```text
mautic.lead.filter = ""
mautic.lead.indexmode = "list"
```

Therefore there was no user-entered remembered filter causing the discrepancy. The forced anonymous exclusion is the cause.

Both human accounts are administrators (`is_admin = 1`), and both have permission to view other users' contacts. Ownership, segments, tenant/project scope, publication state, or role permissions do not hide the one identified contact. To inspect the other 259 rows, explicitly use Mautic's anonymous toggle/search (`is:anonymous`).

## 6. Exact dashboard implementation and query

The widget is defined by:

- `/var/www/html/docroot/app/bundles/LeadBundle/EventListener/DashboardSubscriber.php`
- widget type: `created.leads.in.time`
- display name translation: `mautic.widget.created.leads.in.time`
- model call: `LeadModel::getLeadsLineChartData()`

The query chain is:

1. `DashboardSubscriber::onWidgetDetailGenerate()`
2. `LeadModel::getLeadsLineChartData()`
3. `ChartQuery::fetchTimeData('leads', 'date_added', $filter)`
4. `ChartQuery::prepareTimeDataQuery()` / `applyDateFilters()`

For a daily 2026-07-08 through 2026-08-08 range with the installed widget parameters, the effective SQL is equivalent to:

```sql
SELECT
  DATE_FORMAT(t.date_added, '%Y-%m-%d') AS date,
  COUNT(*) AS count
FROM leads AS t
WHERE t.date_added BETWEEN '2026-07-08 00:00:00'
                       AND '2026-08-08 23:59:59'
GROUP BY DATE_FORMAT(t.date_added, '%Y-%m-%d')
ORDER BY DATE_FORMAT(t.date_added, '%Y-%m-%d') ASC
LIMIT 32;
```

Important properties of this query:

- It counts actual current rows in `leads`.
- It does not count page-hit rows, audit events, reports, or historical statistics.
- One current lead row can contribute at most once to one daily bucket.
- It includes anonymous contacts unless `date_identified IS NOT NULL` is added by a valid widget flag.
- It includes inactive contacts, although none currently exist.
- It cannot count physically deleted contacts after the cache expires because their `leads` rows no longer exist.
- It does not count merged-away contacts; there are no merge rows in this installation.

### Installed widget-parameter mismatch

The two installed “Contacts Created” widget rows contain:

```text
params = a:1:{s:5:"lists";s:21:"identifiedVsAnonymous";}
```

The bundled dashboard assets, including `/var/www/html/docroot/app/assets/dashboards/default.json`, also use `lists`. But `DashboardSubscriber.php` reads `params.flag`, and the current form type creates a field named `flag`. As a result, `identifiedVsAnonymous` is ignored and the code executes the default all-leads branch.

This is a Mautic 7.1.3 bundled dashboard/configuration defect, not a Dar Tahara database-reporting table mismatch.

## 7. Dashboard count versus contact-table count

| Comparison | Count |
|---|---:|
| Sum of current dashboard-equivalent daily SQL | 260 |
| `SELECT COUNT(*) FROM leads` | 260 |
| Default Contacts UI (identified, published, admin can view all) | 1 |
| Historical create audit events | 268 |

The current dashboard and current table agree exactly. The apparent discrepancy is between **all current lead rows** and **identified rows shown by the Contacts UI**.

The audit count is eight higher because it preserves create events for physically deleted rows.

## 8. Page visits and visitor/contact correlation

“Unique visitors” below means distinct `page_hits.lead_id` for the day. Returning visitors can make the daily visitor total differ from contacts first created that day.

| Date | Page visits | Unique tracked leads | Unique IPs | Current contacts created | Identified created | Anonymous created |
|---|---:|---:|---:|---:|---:|---:|
| 2026-07-15 | 26 | 21 | 11 | 21 | 0 | 21 |
| 2026-07-16 | 82 | 69 | 16 | 69 | 0 | 69 |
| 2026-07-18 | 203 | 5 | 3 | 5 | 0 | 5 |
| 2026-07-19 | 8 | 8 | 6 | 8 | 0 | 8 |
| 2026-07-20 | 4 | 4 | 3 | 4 | 0 | 4 |
| 2026-07-22 | 6 | 6 | 4 | 6 | 0 | 6 |
| 2026-07-23 | 57 | 51 | 24 | 51 | 1 | 50 |
| 2026-07-24 | 13 | 13 | 7 | 12 | 0 | 12 |
| 2026-07-25 | 3 | 3 | 3 | 3 | 0 | 3 |
| 2026-07-26 | 16 | 15 | 6 | 15 | 0 | 15 |
| 2026-07-27 | 3 | 3 | 3 | 3 | 0 | 3 |
| 2026-07-28 | 2 | 2 | 2 | 0 | 0 | 0 |
| 2026-07-29 | 8 | 8 | 4 | 8 | 0 | 8 |
| 2026-07-30 | 21 | 21 | 3 | 21 | 0 | 21 |
| 2026-07-31 | 7 | 6 | 4 | 5 | 0 | 5 |
| 2026-08-01 | 6 | 2 | 2 | 1 | 0 | 1 |
| 2026-08-02 | 1 | 1 | 1 | 1 | 0 | 1 |
| 2026-08-03 | 16 | 16 | 1 | 16 | 0 | 16 |
| 2026-08-04 | 1 | 1 | 1 | 1 | 0 | 1 |
| 2026-08-05 | 2 | 1 | 1 | 1 | 0 | 1 |
| 2026-08-06 | 2 | 2 | 1 | 2 | 0 | 2 |
| 2026-08-07 | 4 | 4 | 3 | 4 | 0 | 4 |
| 2026-08-08 | 3 | 3 | 3 | 3 | 0 | 3 |

Total page hits are 494. Every current anonymous contact has an IP association and at least one page hit. There are no null or missing lead references in `page_hits`.

### How tracking creates a lead row

The public `/mtracking.gif` route calls `PublicController::trackingImageAction()`, which calls `PageModel::hitPage()`. `ContactTracker::getContactByIpAddress()` creates a new `Lead` when no tracking device/cookie is available. `createNewContact()` saves that lead and dispatches the normal lead-create audit event.

Current defaults relevant to the volume are:

```text
track_contact_by_ip = false
track_by_fingerprint = false
do_not_track_404_anonymous = false
```

Therefore each trackable, cookie-less browser session can create a new anonymous `leads` row even when the same IP was seen before. Scanner browsers that rotate or discard cookies create many rows.

## 9. Evidence table: source of every historical create

The following categories are mutually exclusive and reconcile to the 268 historical Mautic lead-create events.

| Source | Historical Mautic creates | Current Mautic rows | Evidence |
|---|---:|---:|---|
| Current Supabase early-access leads | 5 | 1 | Four logical Supabase rows; one was recreated after an earlier Mautic deletion |
| Other Dar Tahara API test/transient rows | 4 | 0 | API/audit IDs `9`, `11`, `16`, `258`; all deleted |
| Dar Tahara website anonymous tracking | 126 | 126 | Page-hit host `www.dartahara.com` |
| Mautic-host scanners/bots | 133 | 133 | Page-hit host `marketing.saasolution.es`; probe paths and burst patterns |
| Newsletter registrations in Mautic | 0 | 0 | Newsletter route writes Supabase only |
| Native Mautic forms | 0 | 0 | Zero forms and zero submissions |
| Manual contact creation | 0 | 0 | No human actor in lead-create audit events |
| Imports / cron / integrations | 0 | 0 | Empty `imports`; no creating cron command |
| Unknown | 0 | 0 | Every create is attributed by audit actor and/or page-hit host |
| **Total** | **268** | **260** | Exact reconciliation |

The audit actor split independently confirms the total:

| Audit actor | Create events |
|---|---:|
| System (tracking) | 259 |
| Dar Tahara API | 9 |
| **Total** | **268** |

## 10. Deleted contacts

All eight missing IDs have a `lead/delete` audit entry and a corresponding successful API or UI delete request.

| ID | Created (UTC) | Deleted (UTC) | Delete actor | Delete mechanism |
|---:|---|---|---|---|
| 9 | 2026-07-15 10:45:50 | 2026-07-15 10:51:01 | `dtadmin` / Dar Tahara | `DELETE /api/contacts/9/delete` |
| 11 | 2026-07-15 10:50:02 | 2026-07-15 10:51:02 | `dtadmin` / Dar Tahara | `DELETE /api/contacts/11/delete` |
| 16 | 2026-07-15 11:44:31 | 2026-07-15 11:46:01 | `dtadmin` / Dar Tahara | `DELETE /api/contacts/16/delete` |
| 23 | 2026-07-15 21:11:32 | 2026-07-26 19:06:41 | Othman Deraz | UI batch delete |
| 183 | 2026-07-25 15:00:23 | 2026-07-26 19:06:42 | Othman Deraz | UI batch delete |
| 199 | 2026-07-26 23:39:52 | 2026-08-05 17:05:32 | Yasmina Amaach | UI batch delete |
| 239 | 2026-08-01 17:54:46 | 2026-08-05 17:05:32 | Yasmina Amaach | UI batch delete |
| 258 | 2026-08-05 10:42:09 | 2026-08-05 17:05:32 | Yasmina Amaach | UI batch delete |

No automated process performed these deletions. The first three were explicit authenticated API cleanup calls. The other five were authenticated human UI batch actions.

## 11. Merge, deduplication, inactive, and duplicate checks

- `contact_merge_records`: 0 rows.
- No `lead/merge` audit events.
- Current duplicate non-empty email groups: 0.
- Current inactive contacts: 0.
- No soft-delete field exists.
- The eight missing IDs account exactly for the gap between auto-increment maximum/history (268) and current row count (260).

One logical early-access lead did cause two historical Mautic contact creations: ID `23` was deleted, then a later submission/sync could not find it by email and created ID `199`. ID `199` was later deleted too. This is recreation after manual deletion, not a simultaneous duplicate and not a Mautic merge.

## 12. Dar Tahara integration trace

### Browser tracking

`src/components/analytics/mautic-tracking.tsx` is mounted from `src/app/[locale]/layout.tsx`.

- Loads `${NEXT_PUBLIC_MAUTIC_BASE_URL}/mtc.js` only after analytics consent.
- Sends one initial `mt('send', 'pageview')`.
- Sends another page view only when the Next.js pathname changes.
- Suppresses the same pathname twice through `lastSent`.
- Does not send PII.

There is no contact API call on page load or field change. Page load creates an anonymous Mautic lead only through the tracking mechanism described above.

### Early-access form

`src/components/early-access/early-access-form.tsx` sends one final:

```text
POST /api/early-access/submit
```

The submit button is disabled while `status === "submitting"`. No Mautic call occurs on field changes.

`src/app/api/early-access/submit/route.ts`:

1. validates, rate-limits, screens spam, and verifies Turnstile;
2. persists the lead in Supabase;
3. sends the verification email;
4. calls `syncLeadAfterSubmit()` as a best-effort server-side step.

`src/lib/mautic/client.ts` performs:

1. `GET /api/contacts?search=email:<email>&limit=1&minimal=true`;
2. `PATCH /api/contacts/{id}/edit` when found, otherwise `POST /api/contacts/new`;
3. a further `PATCH` to merge tags;
4. optional segment API calls.

Email verification later calls `syncVerifiedLead()`, which performs the same upsert and updates verification fields/tags. Multiple `PATCH` requests for one contact are therefore expected; they are not multiple contact creates.

The HTTP client has no automatic request retry loop. The sync state machine can mark a failed attempt `retry_scheduled` up to five attempts, but no deployed cron, route, or worker that reconciles those statuses exists in this repository. The comment promising a later reconciliation job is not backed by an implementation.

### Newsletter

`src/app/api/subscribe/route.ts` writes through Supabase RPC `subscribe_to_mailing_list` and optionally sends a confirmation email. It does not import or sync subscribers into Mautic. That is why newsletter signups do not contribute to Mautic form submissions or API-created contacts.

### Frontend duplication conclusion

There is no evidence of a frontend loop creating the dashboard spikes:

- 259/268 creates are Mautic tracker creates, not contact API creates.
- only 9 API creates occurred in the entire period;
- current email duplicates are zero;
- access logs show expected search/create/update/tag sequences rather than repeated create storms.

## 13. Scanner and suspicious traffic

The scanner category is evidence-based: its recorded page URLs target the Mautic host itself, not Dar Tahara. Examples include `/.git/config`, `/.aws/credentials`, many `/.env` variants, `phpinfo.php`, WordPress batch endpoints, framework manifests, `docker-compose.yml`, debug endpoints, and cloud credential/config files.

The largest Mautic-host sources were:

| IP | Page hits | Distinct anonymous leads | Distinct UAs | Observation |
|---|---:|---:|---:|---|
| 195.178.110.223 | 40 | 40 | 4 | Multiple desktop UAs; credential/config probes |
| 157.143.3.35 | 19 | 19 | 1 | Repeated synthetic Nexus/Chrome UA |
| 195.178.110.132 | 16 | 16 | 1 | 16 rows in a five-second burst |
| 91.92.47.81 | 16 | 16 | 7 | Seven browser identities in a three-minute burst |
| 45.148.10.62 | 15 | 15 | 4 | Four UAs in a three-second burst |
| 104.28.217.140 | 18 | 5 | 1 | Framework manifest probing |
| 45.148.10.120 | 4 | 4 | 4 | Four old/different browser identities |
| 82.39.212.193 | 4 | 4 | 3 | Three browser identities in one second |
| 47.128.249.227 | 197 | 1 | 1 | 197 environment/CMS/config probes in seven minutes; cookie persisted |

All 133 Mautic-host leads came from 22 IPs. Mautic's default bot exclusion list does not catch scanners that impersonate ordinary Chrome, Firefox, Safari, or mobile browsers.

## 14. Cron jobs and server logs

The live `www-data` crontab contains:

- `mautic:segments:update`
- `mautic:campaigns:update`
- `mautic:campaigns:trigger`
- `mautic:broadcasts:send`
- `mautic:webhooks:process`
- `messenger:consume failed`
- `mautic:iplookup:download`
- `mautic:maintenance:cleanup --days-old=365`

The host also runs `/opt/projects/mautic/backup.sh` nightly.

None of these jobs imports or creates contacts. The maintenance command is configured only to purge anonymous visitors older than 365 days, so it cannot explain deletion of records created in this investigation window. The `imports` table is empty.

Apache container logs retained the contact API and tracking requests. They show nine successful `POST /api/contacts/new` requests and the explicit delete requests listed above. Caddy has no per-site access-log directive for the Mautic host; its route is a bare reverse proxy. Apache sees Caddy's bridge IP, while Mautic's `ip_addresses` records preserve the forwarded visitor IP used in the traffic analysis.

Retained Mautic logs show short database-connection failures around a stack restart on 2026-07-28. They do not show contact-create, merge, or delete automation and are unrelated to the count discrepancy.

## 15. Cache and reporting data

- Widget rows have `cache_timeout = NULL`, so they inherit `cached_data_timeout`.
- Mautic 7.1.3's configured/default `cached_data_timeout` is 10 minutes.
- No current `dashboard.*` or widget cache items existed in `cache_items` at inspection time.
- No Redis service is configured for this Mautic stack.
- Symfony's compiled filesystem cache contains code/container artifacts, not an alternative contact-statistics history.

Therefore stale cache is not the present cause. A dashboard viewed within ten minutes of a deletion can temporarily show the earlier value, but it will not retain deleted contacts indefinitely.

There is no separate reporting table behind this widget. `audit_log` is the only source inspected that preserves historical creates after deletion, and the widget does not query it.

## 16. Database consistency

The following orphan checks all returned zero:

- `page_hits -> leads`
- `lead_event_log -> leads`
- `lead_ips_xref -> leads`
- `lead_ips_xref -> ip_addresses`
- `form_submissions -> leads`
- `campaign_lead_event_log -> leads`
- `lead_lists_leads -> leads`
- `lead_tags_xref -> leads`
- `contact_merge_records -> leads`

Relevant foreign keys are present. Deletes cascade from leads into event/IP cross-reference data, while `page_hits.lead_id` and `form_submissions.lead_id` use `SET NULL`.

Doctrine migration metadata reports 20 executed, 0 executed-unavailable, and 84 available-but-unrecorded migrations. This installation was created directly at Mautic 7.1.3, so historical migrations not used to build the fresh schema can appear as “new.” No retained migration exception or count-related schema failure was found. This metadata should be validated before a future upgrade, but it is not the cause of the dashboard/UI discrepancy.

### Cross-system consistency problem

Supabase currently has four logical `marketing_leads`, all marked `synchronized`. Their Mautic IDs are `199`, `157`, `183`, and `239`. Only `157` still exists in Mautic. The other three mappings point to rows manually deleted from Mautic.

This is the material integration inconsistency discovered by the investigation. There is no implemented reconciliation worker to repair it automatically.

## 17. Contact IDs

### Current identified contact

ID `157`, created and identified at `2026-07-23 16:24:07` UTC by user ID 2 (`Dar Tahara API`). It is published, has email/name/phone/Supabase ID fields, `early_access_status=pending`, and `lead_stage=early_access_submitted`.

### Deleted identified/API contacts

`9, 11, 16, 23, 183, 199, 239, 258`

### Current scanner-created anonymous contacts (133)

```text
1,2,3,4,5,6,7,8,12,13,14,18,19,20,21,30,31,32,33,34,35,36,37,38,39,40,41,
44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,
68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,
92,93,94,95,96,98,99,107,108,119,120,121,122,123,124,125,126,127,128,129,
130,134,203,205,206,207,213,214,215,216,217,218,219,220,221,222,223,224,225,
226,227,228,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256
```

### Current Dar Tahara website-tracking anonymous contacts (126)

```text
10,15,17,22,24,25,26,27,28,29,42,43,97,100,101,102,103,104,105,106,109,110,
111,112,113,114,115,116,117,118,131,132,133,135,136,137,138,139,140,141,142,
143,144,145,146,147,148,149,150,151,152,153,154,155,156,158,159,160,161,162,
163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,
182,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,200,201,202,
204,208,209,210,211,212,229,230,231,232,233,234,235,236,237,238,240,257,259,
260,261,262,263,264,265,266,267,268
```

## 18. Diagnosis classification

| Candidate cause | Finding |
|---|---|
| Expected Mautic behavior | **Yes:** tracking creates anonymous `leads`; Contacts hides them by default |
| Frontend bug | **No create-loop evidence.** Tracking intentionally fires on page load/navigation |
| Mautic configuration problem | **Yes:** 404 anonymous tracking is enabled; `track_contact_by_ip` is false |
| Mautic dashboard bug | **Yes:** bundled `lists` parameter is ignored by runtime expecting `flag` |
| Database inconsistency | **No internal Mautic orphan/count inconsistency** |
| Cross-system inconsistency | **Yes:** three Supabase rows reference deleted Mautic IDs |
| Bot/scanner traffic | **Yes:** 133 current leads and 342 hits target the Mautic host |
| Stale cache | **No current evidence; maximum normal TTL is 10 minutes** |
| Automatic merge/delete | **No.** Merges are zero; all eight deletes are explicit authenticated actions |
| Cron/import/integration generation | **No.** Imports are empty; cron does not create contacts |

## 19. Recommended fixes

No fix or cleanup was applied during this investigation.

### Safe fixes

1. Edit each “Contacts Created” widget in the UI and explicitly save either **Identified contacts** or **Identified vs anonymous**. Verify the persisted parameter becomes `flag`, not `lists`.
2. Add separate dashboard widgets/labels for identified contacts and anonymous visitors so “contacts” is not used as a synonym for registrations.
3. Add a read-only reconciliation monitor comparing Supabase `mautic_contact_id` values with Mautic `leads.id`.

Risk: low. These changes affect display/monitoring only.

### Configuration fixes

1. Set Mautic's **do not track anonymous 404s** option (`do_not_track_404_anonymous=true`). This directly targets the 133 scanner-created contacts without disabling Dar Tahara page tracking.
2. Protect the Mautic UI at Caddy (for example, Tailscale/VPN/IP authentication for `/s/*`) while leaving only the required tracking and API endpoints reachable from their intended clients.
3. Do not rely on the current bot UA list alone; the observed scanners impersonate normal browsers.

Risk: low to medium. A routing rule that is too broad can break `mtc.js`, `/mtracking.gif`, `/mtc/event`, email redirects, landing pages, or API sync. Test an explicit allowlist of required public routes before deployment.

### Code fixes

1. Provision current dashboard widgets with `flag=identifiedVsAnonymous` (or `flag=identified`) instead of the shipped `lists` key.
2. Implement the promised Mautic reconciliation job for `pending`, `failed`, `retry_scheduled`, and “synchronized but missing contact” rows.
3. During reconciliation, upsert by normalized email/Supabase ID and repair `marketing_leads.mautic_contact_id` after a contact was intentionally recreated.
4. Record the reconciliation outcome without logging PII.

Risk: medium. Reconciliation must be idempotent and serialized per normalized email to avoid concurrent create races.

### Data cleanup (optional, approval required)

Cleanup is not required to make the system function. The 259 anonymous rows are internally consistent tracking data. If scanner noise should be removed, the evidence-backed candidate set is the 133 IDs listed above.

Preview/dry-run query:

```sql
SELECT l.id, l.date_added
FROM leads AS l
WHERE l.date_identified IS NULL
  AND EXISTS (
    SELECT 1
    FROM page_hits AS ph
    WHERE ph.lead_id = l.id
      AND LOWER(ph.url) LIKE 'http%://marketing.saasolution.es/%'
  )
ORDER BY l.id;
```

Count assertion before any cleanup:

```sql
SELECT COUNT(*) AS candidate_count
FROM leads AS l
WHERE l.date_identified IS NULL
  AND EXISTS (
    SELECT 1
    FROM page_hits AS ph
    WHERE ph.lead_id = l.id
      AND LOWER(ph.url) LIKE 'http%://marketing.saasolution.es/%'
  );
-- Expected from this snapshot: 133
```

Required backup before an approved cleanup:

```bash
sudo /opt/projects/mautic/backup.sh
```

Use Mautic's supported batch/API deletion path rather than direct SQL so audit events and application behavior remain consistent. Before executing, export the exact IDs and verify none have become identified since this snapshot.

Rollback requires restoring the pre-cleanup MariaDB backup (and, if other Mautic data changed after the backup, a planned point-in-time or selective restore). Direct deletion is not safely reversible without that backup because related rows cascade or have their lead foreign key set to null.

## 20. Final conclusion

Mautic is not inventing 260 records from a reporting table. It is counting 260 real current rows in `leads`. The UI hides 259 because they are anonymous. The dashboard includes them because the shipped widget parameter is ineffective, and public browser-based scanners materially inflate the anonymous population. Eight additional identified API contacts were real but were explicitly deleted by administrators. The durable corrective path is to fix the widget flag, stop anonymous 404 tracking, protect the Mautic UI surface, and reconcile the three stale Supabase-to-Mautic mappings before considering any approved data cleanup.
