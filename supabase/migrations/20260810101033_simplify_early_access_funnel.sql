-- Split the first Early Access conversion (lead captured) from the existing
-- seven-step qualification flow (onboarding). All changes are additive or
-- relax an old requirement; existing leads and detailed submissions remain.

alter table public.marketing_leads
  alter column last_name drop not null;

alter table public.marketing_leads
  drop constraint if exists marketing_leads_last_name_check;

alter table public.marketing_leads
  add constraint marketing_leads_last_name_check
  check (last_name is null or char_length(last_name) <= 120);

alter table public.lead_consents
  drop constraint if exists lead_consents_consent_type_check;

alter table public.lead_consents
  add constraint lead_consents_consent_type_check
  check (consent_type in (
    'privacy_policy','operational_comms','marketing','accuracy','authorization',
    'onboarding_reminder'
  ));

alter table public.early_access_signup_sessions
  add column if not exists city text
    check (city is null or char_length(btrim(city)) between 1 and 120),
  add column if not exists early_access_registered_at timestamptz,
  add column if not exists onboarding_started_at timestamptz,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.early_access_signup_sessions
  drop constraint if exists early_access_signup_sessions_status_check;

alter table public.early_access_signup_sessions
  add constraint early_access_signup_sessions_status_check
  check (status in (
    'in_progress','early_access_registered','onboarding_started',
    'onboarding_completed','completed','abandoned_eligible','reminder_sent',
    'resumed','opted_out'
  ));

alter table public.early_access_funnel_events
  drop constraint if exists early_access_funnel_events_event_name_check;

alter table public.early_access_funnel_events
  add constraint early_access_funnel_events_event_name_check
  check (event_name in (
    'early_access_viewed','early_access_started','early_access_submitted',
    'early_access_success','early_access_error',
    'early_access_step_viewed','early_access_step_completed',
    'early_access_field_focused','early_access_field_completed',
    'early_access_validation_error','early_access_api_error',
    'early_access_abandoned','early_access_resumed','early_access_completed',
    'early_access_feedback_submitted','onboarding_offered',
    'onboarding_started','onboarding_step_viewed',
    'onboarding_step_completed','onboarding_abandoned',
    'onboarding_completed'
  ));

-- Historical completed seven-step sessions represent both conversions. The
-- old timestamps and status remain readable; new reporting can use the explicit
-- phase timestamps without inventing data for sessions that never completed.
update public.early_access_signup_sessions s
set early_access_registered_at = coalesce(s.early_access_registered_at, s.completed_at),
    onboarding_started_at = coalesce(s.onboarding_started_at, s.started_at),
    onboarding_completed_at = coalesce(s.onboarding_completed_at, s.completed_at),
    city = coalesce(s.city, l.residence_city)
from public.marketing_leads l
where s.lead_id = l.id;

create index if not exists early_access_signup_sessions_registered_idx
  on public.early_access_signup_sessions (early_access_registered_at desc)
  where early_access_registered_at is not null;

create index if not exists early_access_signup_sessions_onboarding_idx
  on public.early_access_signup_sessions (
    onboarding_started_at, onboarding_completed_at, city
  )
  where onboarding_started_at is not null;

comment on column public.early_access_signup_sessions.early_access_registered_at is
  'First conversion: name, email, canonical Moroccan city and marketing consent safely stored.';
comment on column public.early_access_signup_sessions.onboarding_started_at is
  'Second-stage detailed service registration was opened.';
comment on column public.early_access_signup_sessions.onboarding_completed_at is
  'Detailed service registration was successfully persisted.';

create or replace view public.early_access_funnel_step_stats
with (security_invoker = true) as
select
  e.step_id,
  e.step_index,
  count(*) filter (where e.event_name in ('onboarding_step_viewed','early_access_step_viewed'))::bigint as entered,
  count(*) filter (where e.event_name in ('onboarding_step_completed','early_access_step_completed'))::bigint as completed,
  count(*) filter (where e.event_name = 'early_access_validation_error')::bigint as validation_errors,
  avg(e.duration_ms) filter (
    where e.event_name in ('onboarding_step_completed','early_access_step_completed')
      and e.duration_ms is not null
  )::numeric(12,2) as average_duration_ms,
  percentile_cont(0.5) within group (order by e.duration_ms) filter (
    where e.event_name in ('onboarding_step_completed','early_access_step_completed')
      and e.duration_ms is not null
  )::numeric(12,2) as median_duration_ms
from public.early_access_funnel_events e
where e.step_id is not null
group by e.step_id, e.step_index;
