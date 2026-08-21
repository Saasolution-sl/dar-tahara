-- ISO 27001 P2/P3 technical control foundation.
--
-- Retention rules are deliberately disabled until Legal/Privacy and the
-- relevant record owner approve them. This migration creates the enforcement
-- and evidence structures without inventing retention periods.

create table if not exists public.retention_policy_rules (
  category text primary key check (category ~ '^[a-z][a-z0-9_]{2,63}$'),
  system_name text not null,
  record_description text not null,
  retention_days integer check (retention_days between 1 and 36500),
  legal_basis text,
  enabled boolean not null default false,
  approved_by text,
  approved_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  check (not enabled or (
    retention_days is not null
    and nullif(btrim(legal_basis), '') is not null
    and nullif(btrim(approved_by), '') is not null
    and approved_at is not null
  ))
);

create table if not exists public.legal_holds (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type ~ '^[a-z][a-z0-9_]{2,63}$'),
  subject_reference text not null,
  reason text not null check (char_length(reason) between 10 and 1000),
  active boolean not null default true,
  approved_by text not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  released_by text,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at > starts_at),
  check (active or (released_by is not null and released_at is not null))
);

create unique index if not exists legal_holds_one_active_subject_idx
  on public.legal_holds(subject_type, subject_reference)
  where active;

create table if not exists public.retention_execution_log (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  category text not null references public.retention_policy_rules(category) on delete restrict,
  mode text not null check (mode in ('dry_run', 'execute')),
  status text not null check (status in ('started', 'succeeded', 'failed', 'blocked')),
  candidates integer not null default 0 check (candidates >= 0),
  deleted integer not null default 0 check (deleted >= 0),
  held integer not null default 0 check (held >= 0),
  error_code text,
  evidence jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  check (jsonb_typeof(evidence) = 'object')
);

create index if not exists retention_execution_log_category_time_idx
  on public.retention_execution_log(category, occurred_at desc);

create table if not exists public.security_event_log (
  event_id uuid primary key,
  occurred_at timestamptz not null,
  event_type text not null check (event_type ~ '^[a-z][a-z0-9_]{2,63}$'),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  source text not null,
  actor_id text,
  correlation_id text,
  metadata jsonb not null default '{}'::jsonb,
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  ingested_at timestamptz not null default now(),
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists security_event_log_severity_time_idx
  on public.security_event_log(severity, occurred_at desc);

create or replace function private.prevent_security_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_setting('app.security_event_maintenance', true) is distinct from 'on' then
    raise exception 'security_event_log_is_append_only' using errcode = '42501';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists security_event_log_append_only on public.security_event_log;
create trigger security_event_log_append_only
before update or delete on public.security_event_log
for each row execute function private.prevent_security_event_mutation();

insert into public.retention_policy_rules(category, system_name, record_description)
values
  ('customer_account', 'Supabase/Auth', 'Customer identity, profile and account records'),
  ('property_service', 'Supabase', 'Property, assessment, booking and service records'),
  ('billing_finance', 'Supabase/Stripe', 'Invoices, payments, refunds and financial evidence'),
  ('support_content', 'Supabase/Cubbit/Support', 'Support messages and attachments'),
  ('marketing_leads', 'Supabase/Mautic', 'Early-access, referral and marketing lead records'),
  ('security_audit', 'Supabase/Log sink', 'Security, audit and access event records'),
  ('employee_hr', 'Supabase/HR', 'Employee, contractor and lifecycle records'),
  ('whatsapp_messages', 'Supabase/WhatsApp', 'WhatsApp message and processed webhook records'),
  ('whatsapp_audit', 'Supabase/WhatsApp', 'WhatsApp bot audit and decision records'),
  ('assistant_knowledge_gaps', 'Supabase/Assistant', 'Assistant knowledge-gap observations'),
  ('assistant_provider_events', 'Supabase/Assistant', 'Assistant provider telemetry and event records'),
  ('early_access_partial_pii', 'Supabase/Early Access', 'Incomplete signup session contact and form data'),
  ('assessment_confirmation_evidence', 'Supabase Storage/Assessments', 'Customer identity-confirmation evidence images')
on conflict (category) do nothing;

alter table public.retention_policy_rules enable row level security;
alter table public.legal_holds enable row level security;
alter table public.retention_execution_log enable row level security;
alter table public.security_event_log enable row level security;

revoke all on table public.retention_policy_rules, public.legal_holds,
  public.retention_execution_log, public.security_event_log from public, anon, authenticated;
grant select, insert, update on table public.retention_policy_rules, public.legal_holds to service_role;
grant select, insert on table public.retention_execution_log, public.security_event_log to service_role;

alter table public.support_attachments
  add column if not exists scan_status text not null default 'legacy_unverified'
    check (scan_status in ('quarantined', 'clean', 'clean_signature_only', 'rejected', 'legacy_unverified')),
  add column if not exists scan_engine text,
  add column if not exists scan_signature text,
  add column if not exists content_sha256 text check (content_sha256 is null or content_sha256 ~ '^[0-9a-f]{64}$'),
  add column if not exists scanned_at timestamptz;

alter table public.pause_request_attachments
  add column if not exists scan_status text not null default 'legacy_unverified'
    check (scan_status in ('quarantined', 'clean', 'clean_signature_only', 'rejected', 'legacy_unverified')),
  add column if not exists scan_engine text,
  add column if not exists scan_signature text,
  add column if not exists content_sha256 text check (content_sha256 is null or content_sha256 ~ '^[0-9a-f]{64}$'),
  add column if not exists scanned_at timestamptz;

alter table public.assessment_confirmations
  alter column retention_delete_after drop not null,
  add column if not exists scan_status text not null default 'legacy_unverified'
    check (scan_status in ('quarantined', 'clean', 'clean_signature_only', 'rejected', 'legacy_unverified')),
  add column if not exists scan_engine text,
  add column if not exists scan_signature text,
  add column if not exists content_sha256 text check (content_sha256 is null or content_sha256 ~ '^[0-9a-f]{64}$'),
  add column if not exists scanned_at timestamptz;

create or replace function public.cleanup_early_access_partial_pii(retention_days integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed integer;
begin
  if retention_days < 1 then raise exception 'retention days must be positive'; end if;
  update public.early_access_signup_sessions
  set partial_payload = '{}'::jsonb,
      email = null,
      normalized_email = null,
      email_present = false,
      reminder_consent = false,
      resume_token_hash = null,
      resume_token_expires_at = null,
      feedback_token_hash = null,
      feedback_token_expires_at = null,
      reminder_claimed_at = null,
      reminder_claimed_number = null,
      pii_purged_at = now()
  where last_activity_at < now() - make_interval(days => retention_days)
    and pii_purged_at is null;
  get diagnostics changed = row_count;
  return changed;
end;
$$;

create or replace function public.schedule_assessment_confirmation_retention(retention_days integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed integer;
begin
  if retention_days < 1 then raise exception 'retention days must be positive'; end if;
  update public.assessment_confirmations
  set retention_delete_after = customer_confirmed_at + make_interval(days => retention_days)
  where evidence_deleted_at is null
    and retention_delete_after is distinct from customer_confirmed_at + make_interval(days => retention_days);
  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.cleanup_early_access_partial_pii(integer),
  public.schedule_assessment_confirmation_retention(integer) from public, anon, authenticated;
grant execute on function public.cleanup_early_access_partial_pii(integer),
  public.schedule_assessment_confirmation_retention(integer) to service_role;

-- New pause-request attachments must go through the authenticated server route
-- so the body can be signature-checked and malware-scanned before persistence.
revoke insert on table public.pause_request_attachments from authenticated;
drop policy if exists pause_request_attachments_insert_own on public.pause_request_attachments;

drop policy if exists support_attachments_read_own on public.support_attachments;
create policy support_attachments_read_own on public.support_attachments for select to authenticated
using (
  visibility = 'customer'
  and scan_status in ('clean', 'clean_signature_only')
  and customer_id in (
    select id from public.customers where auth_user_id = (select auth.uid())
  )
);

drop policy if exists pause_request_attachments_read_own on public.pause_request_attachments;
create policy pause_request_attachments_read_own on public.pause_request_attachments for select to authenticated
using (
  scan_status in ('clean', 'clean_signature_only')
  and customer_id in (
    select id from public.customers where auth_user_id = (select auth.uid())
  )
);
