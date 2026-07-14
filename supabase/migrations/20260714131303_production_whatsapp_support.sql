create extension if not exists pgcrypto;

-- The earlier shared-assistant migration created a minimal whatsapp_contacts
-- table. Preserve it for audit/history, but remove clear wa_id values before
-- creating the production table with encrypted/HMAC-backed identifiers.
do $$
begin
  if to_regclass('public.whatsapp_contacts') is not null
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'whatsapp_contacts' and column_name = 'wa_id'
    )
    and not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'whatsapp_contacts' and column_name = 'whatsapp_user_id'
    )
  then
    if to_regclass('public.whatsapp_contacts_legacy') is not null then
      raise exception 'whatsapp_contacts_legacy already exists; manual migration review required';
    end if;
    alter table public.whatsapp_contacts rename to whatsapp_contacts_legacy;
    update public.whatsapp_contacts_legacy
      set wa_id = encode(extensions.digest(wa_id, 'sha256'), 'hex');
    comment on table public.whatsapp_contacts_legacy is
      'Legacy assistant contacts. wa_id was irreversibly SHA-256 hashed during the production WhatsApp migration.';
  end if;
end $$;

create table if not exists public.whatsapp_contacts (
  id uuid primary key default gen_random_uuid(),
  -- HMAC-SHA256 of Meta's wa_id. The clear identifier is never stored here.
  whatsapp_user_id text not null unique,
  phone_number_encrypted text,
  phone_number_hash text unique,
  display_name text,
  email text,
  email_verified boolean not null default false,
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  consent_status text not null default 'unknown'
    check (consent_status in ('unknown', 'granted', 'denied', 'withdrawn')),
  consent_timestamp timestamptz,
  blocked_until timestamptz,
  abuse_count integer not null default 0 check (abuse_count >= 0),
  first_contact_at timestamptz not null default now(),
  last_contact_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.whatsapp_contacts(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'awaiting_customer', 'awaiting_email', 'escalated', 'closed', 'blocked')),
  detected_language text not null default 'en'
    check (detected_language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  current_intent text,
  escalation_status text not null default 'none'
    check (escalation_status in (
      'none', 'escalation_required', 'awaiting_email', 'email_received',
      'creating_ticket', 'escalated', 'ticket_creation_failed', 'retry_pending', 'closed'
    )),
  assigned_ticket_id uuid,
  failed_resolution_attempts integer not null default 0
    check (failed_resolution_attempts between 0 and 100),
  conversation_summary text,
  customer_profile jsonb not null default '{}'::jsonb,
  last_customer_message_at timestamptz,
  last_bot_message_at timestamptz,
  service_window_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  external_message_id text not null unique,
  direction text not null check (direction in ('inbound', 'outbound')),
  message_type text not null
    check (message_type in ('text', 'button', 'interactive', 'image', 'audio', 'video', 'document', 'sticker', 'location', 'contacts', 'unknown')),
  message_body_encrypted text,
  message_body_redacted text,
  language text check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  delivery_status text not null default 'received'
    check (delivery_status in ('received', 'queued', 'sent', 'delivered', 'read', 'failed', 'ignored')),
  ai_generated boolean not null default false,
  model_name text,
  token_usage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.support_escalations (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  contact_id uuid not null references public.whatsapp_contacts(id) on delete cascade,
  reason text not null,
  category text not null,
  severity text not null default 'normal'
    check (severity in ('low', 'normal', 'high', 'urgent')),
  customer_summary text not null default '',
  internal_summary text not null default '',
  freescout_conversation_id text,
  freescout_ticket_number text,
  customer_email text,
  status text not null default 'escalation_required'
    check (status in (
      'escalation_required', 'awaiting_email', 'email_received', 'creating_ticket',
      'escalated', 'ticket_creation_failed', 'retry_pending', 'resolved', 'closed'
    )),
  idempotency_key text not null unique,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_retry_at timestamptz,
  last_error text,
  customer_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'whatsapp_conversations_assigned_ticket_fkey'
      and conrelid = 'public.whatsapp_conversations'::regclass
  ) then
    alter table public.whatsapp_conversations
      add constraint whatsapp_conversations_assigned_ticket_fkey
      foreign key (assigned_ticket_id) references public.support_escalations(id) on delete set null;
  end if;
end $$;

create table if not exists public.knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  category text not null,
  title text not null,
  language text not null check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  version integer not null default 1 check (version > 0),
  effective_from timestamptz,
  created_by uuid references public.staff_members(id) on delete set null,
  updated_by uuid references public.staff_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, language, version)
);

create table if not exists public.bot_audit_logs (
  id bigint generated always as identity primary key,
  conversation_id uuid references public.whatsapp_conversations(id) on delete set null,
  event_type text not null,
  event_metadata jsonb not null default '{}'::jsonb,
  correlation_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null,
  payload_hash text not null,
  payload jsonb not null default '{}'::jsonb,
  processing_status text not null default 'pending'
    check (processing_status in ('pending', 'processing', 'processed', 'retry_pending', 'failed', 'ignored')),
  correlation_id uuid not null default gen_random_uuid(),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_retry_at timestamptz,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text,
  unique (provider, external_event_id)
);

create index if not exists whatsapp_contacts_whatsapp_user_id_idx
  on public.whatsapp_contacts (whatsapp_user_id);
create index if not exists whatsapp_contacts_email_idx
  on public.whatsapp_contacts (lower(email)) where email is not null;
create index if not exists whatsapp_conversations_contact_status_idx
  on public.whatsapp_conversations (contact_id, status, last_customer_message_at desc);
create index if not exists whatsapp_conversations_status_idx
  on public.whatsapp_conversations (status, last_customer_message_at desc);
create index if not exists whatsapp_conversations_escalation_idx
  on public.whatsapp_conversations (escalation_status, updated_at desc)
  where escalation_status <> 'none';
create index if not exists whatsapp_messages_conversation_created_idx
  on public.whatsapp_messages (conversation_id, created_at desc);
create index if not exists support_escalations_conversation_idx
  on public.support_escalations (conversation_id, created_at desc);
create index if not exists support_escalations_status_retry_idx
  on public.support_escalations (status, next_retry_at)
  where status in ('ticket_creation_failed', 'retry_pending');
create index if not exists support_escalations_email_idx
  on public.support_escalations (lower(customer_email)) where customer_email is not null;
create index if not exists support_escalations_ticket_idx
  on public.support_escalations (freescout_ticket_number) where freescout_ticket_number is not null;
create index if not exists knowledge_entries_slug_language_idx
  on public.knowledge_entries (slug, language, status, version desc);
create index if not exists knowledge_entries_published_category_idx
  on public.knowledge_entries (language, category, effective_from desc)
  where status = 'published';
create index if not exists bot_audit_logs_conversation_created_idx
  on public.bot_audit_logs (conversation_id, created_at desc);
create index if not exists webhook_events_external_event_idx
  on public.webhook_events (external_event_id);
create index if not exists webhook_events_pending_idx
  on public.webhook_events (processing_status, next_retry_at, received_at)
  where processing_status in ('pending', 'retry_pending');

drop trigger if exists whatsapp_contacts_set_updated_at on public.whatsapp_contacts;
create trigger whatsapp_contacts_set_updated_at before update on public.whatsapp_contacts
for each row execute function private.set_updated_at();
drop trigger if exists whatsapp_conversations_set_updated_at on public.whatsapp_conversations;
create trigger whatsapp_conversations_set_updated_at before update on public.whatsapp_conversations
for each row execute function private.set_updated_at();
drop trigger if exists support_escalations_set_updated_at on public.support_escalations;
create trigger support_escalations_set_updated_at before update on public.support_escalations
for each row execute function private.set_updated_at();
drop trigger if exists knowledge_entries_set_updated_at on public.knowledge_entries;
create trigger knowledge_entries_set_updated_at before update on public.knowledge_entries
for each row execute function private.set_updated_at();

alter table public.whatsapp_contacts enable row level security;
alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.support_escalations enable row level security;
alter table public.knowledge_entries enable row level security;
alter table public.bot_audit_logs enable row level security;
alter table public.webhook_events enable row level security;

revoke all on table public.whatsapp_contacts, public.whatsapp_conversations,
  public.whatsapp_messages, public.support_escalations, public.knowledge_entries,
  public.bot_audit_logs, public.webhook_events
from public, anon, authenticated;

grant select, insert, update, delete on table public.whatsapp_contacts,
  public.whatsapp_conversations, public.whatsapp_messages, public.support_escalations,
  public.knowledge_entries, public.bot_audit_logs, public.webhook_events
to service_role;
grant usage, select on sequence public.bot_audit_logs_id_seq to service_role;

create or replace function public.claim_next_whatsapp_webhook_event()
returns setof public.webhook_events
language sql
security invoker
set search_path = ''
as $$
  update public.webhook_events
  set processing_status = 'processing',
      attempt_count = attempt_count + 1,
      error_message = null
  where id = (
    select id
    from public.webhook_events
    where provider = 'meta_whatsapp'
      and processing_status in ('pending', 'retry_pending')
      and (next_retry_at is null or next_retry_at <= now())
    order by received_at
    limit 1
    for update skip locked
  )
  returning *;
$$;

create or replace function public.cleanup_whatsapp_retention(
  message_retention_days integer,
  audit_retention_days integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted_messages integer;
  deleted_audits integer;
  deleted_webhooks integer;
begin
  if message_retention_days < 1 or audit_retention_days < 1 then
    raise exception 'retention days must be positive';
  end if;

  delete from public.whatsapp_messages
  where created_at < now() - make_interval(days => message_retention_days);
  get diagnostics deleted_messages = row_count;

  delete from public.bot_audit_logs
  where created_at < now() - make_interval(days => audit_retention_days);
  get diagnostics deleted_audits = row_count;

  delete from public.webhook_events
  where received_at < now() - make_interval(days => message_retention_days)
    and processing_status in ('processed', 'ignored', 'failed');
  get diagnostics deleted_webhooks = row_count;

  return jsonb_build_object(
    'messages', deleted_messages,
    'audit_logs', deleted_audits,
    'webhook_events', deleted_webhooks
  );
end;
$$;

revoke all on function public.claim_next_whatsapp_webhook_event() from public, anon, authenticated;
revoke all on function public.cleanup_whatsapp_retention(integer, integer) from public, anon, authenticated;
grant execute on function public.claim_next_whatsapp_webhook_event() to service_role;
grant execute on function public.cleanup_whatsapp_retention(integer, integer) to service_role;
