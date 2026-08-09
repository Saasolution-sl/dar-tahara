-- Privacy-conscious Early Access signup sessions, funnel events and feedback.
-- Browser roles receive no direct access. The Next.js server uses the service
-- role and authenticates every public session mutation with a hashed bearer
-- token before writing.

create table if not exists public.early_access_signup_sessions (
  id uuid primary key default gen_random_uuid(),
  client_token_hash text not null unique,

  lead_id uuid references public.marketing_leads(id) on delete set null,
  mautic_contact_id bigint,
  email text,
  normalized_email text,
  email_present boolean not null default false,
  reminder_consent boolean not null default false,

  status text not null default 'in_progress'
    check (status in (
      'in_progress','completed','abandoned_eligible','reminder_sent',
      'resumed','opted_out'
    )),
  current_step text not null default 'contact'
    check (current_step in (
      'contact','billing','property_address','property_info',
      'services','access','review'
    )),
  current_step_index smallint not null default 0
    check (current_step_index between 0 and 6),
  highest_completed_step smallint not null default -1
    check (highest_completed_step between -1 and 6),
  client_revision bigint not null default 0 check (client_revision >= 0),

  -- Service-role only. No PII is kept in browser storage; this is cleared on
  -- completion and removed from stale sessions by the retention job.
  partial_payload jsonb not null default '{}'::jsonb,

  source_code text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer_host text,
  device_type text check (device_type is null or device_type in ('desktop','mobile','tablet','unknown')),
  browser text,
  operating_system text,
  locale text,

  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz,
  abandoned_at timestamptz,
  resumed_at timestamptz,
  opted_out_at timestamptz,
  pii_purged_at timestamptz,
  completed_after_reminder boolean not null default false,

  reminder_count smallint not null default 0 check (reminder_count between 0 and 2),
  reminder_1_queued_at timestamptz,
  reminder_2_queued_at timestamptz,
  reminder_claimed_at timestamptz,
  reminder_claimed_number smallint check (reminder_claimed_number is null or reminder_claimed_number in (1,2)),
  resume_token_hash text,
  resume_token_expires_at timestamptz,
  feedback_token_hash text,
  feedback_token_expires_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists early_access_signup_sessions_resume_token_key
  on public.early_access_signup_sessions (resume_token_hash)
  where resume_token_hash is not null;
create unique index if not exists early_access_signup_sessions_feedback_token_key
  on public.early_access_signup_sessions (feedback_token_hash)
  where feedback_token_hash is not null;
create index if not exists early_access_signup_sessions_activity_idx
  on public.early_access_signup_sessions (status, last_activity_at);
create index if not exists early_access_signup_sessions_reminder_idx
  on public.early_access_signup_sessions (status, reminder_consent, reminder_count, abandoned_at);
create index if not exists early_access_signup_sessions_started_idx
  on public.early_access_signup_sessions (started_at desc);
create index if not exists early_access_signup_sessions_email_idx
  on public.early_access_signup_sessions (normalized_email)
  where normalized_email is not null;

create table if not exists public.early_access_funnel_events (
  id uuid primary key default gen_random_uuid(),
  signup_session_id uuid not null references public.early_access_signup_sessions(id) on delete cascade,
  event_name text not null check (event_name in (
    'early_access_viewed','early_access_started',
    'early_access_step_viewed','early_access_step_completed',
    'early_access_field_focused','early_access_field_completed',
    'early_access_validation_error','early_access_api_error',
    'early_access_abandoned','early_access_resumed',
    'early_access_completed','early_access_feedback_submitted'
  )),
  idempotency_key text,
  occurred_at timestamptz not null default now(),
  step_id text check (step_id is null or step_id in (
    'contact','billing','property_address','property_info',
    'services','access','review'
  )),
  step_index smallint check (step_index is null or step_index between 0 and 6),
  field_name text,
  error_type text,
  error_code text,
  duration_ms integer check (duration_ms is null or duration_ms between 0 and 86400000),
  total_duration_ms integer check (total_duration_ms is null or total_duration_ms between 0 and 604800000),
  metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists early_access_funnel_events_idempotency_key
  on public.early_access_funnel_events (signup_session_id, idempotency_key);
create index if not exists early_access_funnel_events_session_time_idx
  on public.early_access_funnel_events (signup_session_id, occurred_at);
create index if not exists early_access_funnel_events_name_time_idx
  on public.early_access_funnel_events (event_name, occurred_at desc);
create index if not exists early_access_funnel_events_step_idx
  on public.early_access_funnel_events (step_id, event_name, occurred_at desc);

create table if not exists public.early_access_abandonment_feedback (
  id uuid primary key default gen_random_uuid(),
  signup_session_id uuid not null unique references public.early_access_signup_sessions(id) on delete cascade,
  reason text not null check (reason in (
    'just_looking','too_long','price_unclear','not_ready',
    'address_difficult','technical_problem','unclear',
    'privacy_concern','service_unavailable','changed_mind','other'
  )),
  comments text check (comments is null or char_length(comments) <= 2000),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists early_access_signup_sessions_set_updated_at on public.early_access_signup_sessions;
create trigger early_access_signup_sessions_set_updated_at
  before update on public.early_access_signup_sessions
  for each row execute function private.set_updated_at();

drop trigger if exists early_access_abandonment_feedback_set_updated_at on public.early_access_abandonment_feedback;
create trigger early_access_abandonment_feedback_set_updated_at
  before update on public.early_access_abandonment_feedback
  for each row execute function private.set_updated_at();

-- Aggregated step view for the administrator dashboard. No identity or partial
-- form data is exposed here. The application still reads it with service role.
create or replace view public.early_access_funnel_step_stats
with (security_invoker = true) as
select
  s.step_id,
  s.step_index,
  count(*) filter (where s.event_name = 'early_access_step_viewed')::bigint as entered,
  count(*) filter (where s.event_name = 'early_access_step_completed')::bigint as completed,
  count(*) filter (where s.event_name = 'early_access_validation_error')::bigint as validation_errors,
  avg(s.duration_ms) filter (
    where s.event_name = 'early_access_step_completed' and s.duration_ms is not null
  )::numeric(12,2) as average_duration_ms,
  percentile_cont(0.5) within group (order by s.duration_ms) filter (
    where s.event_name = 'early_access_step_completed' and s.duration_ms is not null
  )::numeric(12,2) as median_duration_ms
from public.early_access_funnel_events s
where s.step_id is not null
group by s.step_id, s.step_index;

do $$
declare t text;
begin
  foreach t in array array[
    'early_access_signup_sessions',
    'early_access_funnel_events',
    'early_access_abandonment_feedback'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on table public.%I from anon;', t);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all on table public.%I from authenticated;', t);
    end if;
  end loop;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table public.early_access_funnel_step_stats from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table public.early_access_funnel_step_stats from authenticated;
  end if;
end
$$;
