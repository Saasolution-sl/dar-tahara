create extension if not exists pgcrypto;

create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  channel text not null check (channel in ('website', 'whatsapp')),
  status text not null default 'open'
    check (status in ('open', 'handoff_requested', 'human_active', 'closed')),
  language text not null default 'en'
    check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  customer_name text,
  contact_handle text,
  assigned_staff_id uuid references public.staff_members(id) on delete set null,
  last_intent text,
  handoff_reason text,
  last_message_at timestamptz not null default now(),
  closed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.assistant_conversations(id) on delete cascade,
  role text not null check (role in ('customer', 'assistant', 'human', 'system')),
  channel text not null check (channel in ('website', 'whatsapp')),
  language text check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  body text not null,
  intent text,
  confidence numeric(4,3) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.assistant_tool_calls (
  id bigint generated always as identity primary key,
  conversation_id uuid references public.assistant_conversations(id) on delete cascade,
  message_id bigint references public.assistant_messages(id) on delete set null,
  tool_name text not null,
  input jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  status text not null check (status in ('success', 'failed', 'skipped')),
  error_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null default 'version_control'
    check (source_type in ('version_control', 'admin', 'policy', 'terms', 'website')),
  source_url text,
  owner text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'archived')),
  visibility text not null default 'public' check (visibility in ('public', 'internal')),
  source_id uuid references public.knowledge_sources(id) on delete set null,
  effective_date date,
  last_reviewed_date date,
  keywords text[] not null default '{}'::text[],
  related_questions text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.staff_members(id) on delete set null,
  updated_by uuid references public.staff_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.knowledge_articles(id) on delete cascade,
  version integer not null check (version > 0),
  title text not null,
  summary text not null,
  body text not null,
  approved_by uuid references public.staff_members(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (article_id, version)
);

create table if not exists public.knowledge_translations (
  id uuid primary key default gen_random_uuid(),
  article_version_id uuid not null references public.knowledge_article_versions(id) on delete cascade,
  language text not null check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  title text not null,
  summary text not null,
  body text not null,
  review_status text not null default 'needs_review'
    check (review_status in ('needs_review', 'approved', 'archived')),
  reviewed_by uuid references public.staff_members(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_version_id, language)
);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  knowledge_article_id uuid references public.knowledge_articles(id) on delete set null,
  language text not null check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  question text not null,
  answer text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_cases (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  conversation_id uuid references public.assistant_conversations(id) on delete set null,
  assessment_id uuid references public.home_assessments(id) on delete set null,
  channel text not null check (channel in ('website', 'whatsapp', 'email', 'phone')),
  status text not null default 'open'
    check (status in ('open', 'assigned', 'waiting_customer', 'resolved', 'closed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  category text not null,
  language text not null default 'en'
    check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  subject text not null,
  summary text not null,
  assigned_staff_id uuid references public.staff_members(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.assistant_feedback (
  id bigint generated always as identity primary key,
  conversation_id uuid references public.assistant_conversations(id) on delete cascade,
  message_id bigint references public.assistant_messages(id) on delete set null,
  rating text not null check (rating in ('correct', 'incorrect', 'helpful', 'unhelpful')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_summaries (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.assistant_conversations(id) on delete cascade,
  summary text not null,
  language text not null default 'en'
    check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  token_count integer,
  created_at timestamptz not null default now()
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  conversation_id uuid references public.assistant_conversations(id) on delete set null,
  consent_type text not null check (consent_type in ('support_handoff', 'whatsapp_opt_in', 'marketing', 'data_export')),
  status text not null check (status in ('granted', 'withdrawn', 'denied')),
  channel text not null check (channel in ('website', 'whatsapp', 'email', 'phone')),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_contacts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  wa_id text not null unique,
  display_name text,
  preferred_language text check (preferred_language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  opt_in_status text not null default 'unknown' check (opt_in_status in ('unknown', 'opted_in', 'opted_out')),
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_events (
  provider_event_id text primary key,
  event_type text not null,
  phone_number text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.assistant_suggested_questions (
  id uuid primary key default gen_random_uuid(),
  language text not null check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  label text not null,
  action text not null default 'ask',
  target text,
  status text not null default 'approved' check (status in ('draft', 'approved', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_operating_hours (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  timezone text not null default 'Africa/Casablanca',
  status text not null default 'open' check (status in ('open', 'closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_audit_logs (
  id bigint generated always as identity primary key,
  actor_type text not null check (actor_type in ('system', 'assistant', 'admin', 'customer', 'whatsapp')),
  actor_reference text,
  action text not null,
  subject_table text,
  subject_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists assistant_conversations_channel_status_idx
  on public.assistant_conversations(channel, status, last_message_at desc);
create index if not exists assistant_conversations_customer_idx
  on public.assistant_conversations(customer_id, last_message_at desc);
create index if not exists assistant_conversations_contact_idx
  on public.assistant_conversations(channel, contact_handle, last_message_at desc);
create index if not exists assistant_messages_conversation_idx
  on public.assistant_messages(conversation_id, created_at);
create index if not exists assistant_tool_calls_conversation_idx
  on public.assistant_tool_calls(conversation_id, created_at desc);
create index if not exists knowledge_articles_status_category_idx
  on public.knowledge_articles(status, category, visibility);
create index if not exists knowledge_translations_language_idx
  on public.knowledge_translations(language, review_status);
create index if not exists support_cases_status_priority_idx
  on public.support_cases(status, priority, created_at desc);
create index if not exists whatsapp_contacts_customer_idx
  on public.whatsapp_contacts(customer_id);
create index if not exists whatsapp_events_phone_idx
  on public.whatsapp_events(phone_number, created_at desc);

drop trigger if exists assistant_conversations_set_updated_at on public.assistant_conversations;
create trigger assistant_conversations_set_updated_at before update on public.assistant_conversations
for each row execute function private.set_updated_at();
drop trigger if exists knowledge_sources_set_updated_at on public.knowledge_sources;
create trigger knowledge_sources_set_updated_at before update on public.knowledge_sources
for each row execute function private.set_updated_at();
drop trigger if exists knowledge_articles_set_updated_at on public.knowledge_articles;
create trigger knowledge_articles_set_updated_at before update on public.knowledge_articles
for each row execute function private.set_updated_at();
drop trigger if exists knowledge_translations_set_updated_at on public.knowledge_translations;
create trigger knowledge_translations_set_updated_at before update on public.knowledge_translations
for each row execute function private.set_updated_at();
drop trigger if exists faq_items_set_updated_at on public.faq_items;
create trigger faq_items_set_updated_at before update on public.faq_items
for each row execute function private.set_updated_at();
drop trigger if exists support_cases_set_updated_at on public.support_cases;
create trigger support_cases_set_updated_at before update on public.support_cases
for each row execute function private.set_updated_at();
drop trigger if exists whatsapp_contacts_set_updated_at on public.whatsapp_contacts;
create trigger whatsapp_contacts_set_updated_at before update on public.whatsapp_contacts
for each row execute function private.set_updated_at();
drop trigger if exists assistant_suggested_questions_set_updated_at on public.assistant_suggested_questions;
create trigger assistant_suggested_questions_set_updated_at before update on public.assistant_suggested_questions
for each row execute function private.set_updated_at();
drop trigger if exists assistant_operating_hours_set_updated_at on public.assistant_operating_hours;
create trigger assistant_operating_hours_set_updated_at before update on public.assistant_operating_hours
for each row execute function private.set_updated_at();

alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.assistant_tool_calls enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_articles enable row level security;
alter table public.knowledge_article_versions enable row level security;
alter table public.knowledge_translations enable row level security;
alter table public.faq_items enable row level security;
alter table public.support_cases enable row level security;
alter table public.assistant_feedback enable row level security;
alter table public.conversation_summaries enable row level security;
alter table public.consent_records enable row level security;
alter table public.whatsapp_contacts enable row level security;
alter table public.whatsapp_events enable row level security;
alter table public.assistant_suggested_questions enable row level security;
alter table public.assistant_operating_hours enable row level security;
alter table public.assistant_audit_logs enable row level security;

revoke all on table public.assistant_conversations, public.assistant_messages,
  public.assistant_tool_calls, public.knowledge_sources, public.knowledge_articles,
  public.knowledge_article_versions, public.knowledge_translations, public.faq_items,
  public.support_cases, public.assistant_feedback, public.conversation_summaries,
  public.consent_records, public.whatsapp_contacts, public.whatsapp_events,
  public.assistant_suggested_questions, public.assistant_operating_hours,
  public.assistant_audit_logs
from anon, authenticated;

grant select, insert, update, delete on table public.assistant_conversations,
  public.assistant_messages, public.assistant_tool_calls, public.knowledge_sources,
  public.knowledge_articles, public.knowledge_article_versions,
  public.knowledge_translations, public.faq_items, public.support_cases,
  public.assistant_feedback, public.conversation_summaries, public.consent_records,
  public.whatsapp_contacts, public.whatsapp_events, public.assistant_suggested_questions,
  public.assistant_operating_hours, public.assistant_audit_logs
to service_role;
grant usage, select on all sequences in schema public to service_role;

grant select on table public.assistant_conversations, public.assistant_messages,
  public.support_cases, public.assistant_feedback, public.conversation_summaries,
  public.consent_records
to authenticated;

create policy assistant_conversations_read_own on public.assistant_conversations
for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));

create policy assistant_messages_read_own on public.assistant_messages
for select to authenticated
using (conversation_id in (
  select ac.id from public.assistant_conversations ac
  join public.customers c on c.id = ac.customer_id
  where c.auth_user_id = (select auth.uid())
));

create policy support_cases_read_own on public.support_cases
for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));

create policy assistant_feedback_read_own on public.assistant_feedback
for select to authenticated
using (conversation_id in (
  select ac.id from public.assistant_conversations ac
  join public.customers c on c.id = ac.customer_id
  where c.auth_user_id = (select auth.uid())
));

create policy conversation_summaries_read_own on public.conversation_summaries
for select to authenticated
using (conversation_id in (
  select ac.id from public.assistant_conversations ac
  join public.customers c on c.id = ac.customer_id
  where c.auth_user_id = (select auth.uid())
));

create policy consent_records_read_own on public.consent_records
for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));

notify pgrst, 'reload schema';
