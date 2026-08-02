-- HospitalitySupport / FreeScout customer portal integration.
-- HospitalitySupport remains authoritative; these tables contain ownership,
-- customer-visible cache data, delivery state, and idempotency boundaries.

create sequence if not exists public.support_reference_seq start 100001;
revoke all on sequence public.support_reference_seq from public, anon, authenticated;
grant usage, select, update on sequence public.support_reference_seq to service_role;

alter table public.support_requests drop constraint if exists support_requests_status_check;
alter table public.support_requests
  add column if not exists public_reference text,
  add column if not exists external_reference text,
  add column if not exists hospitality_support_conversation_id text,
  add column if not exists hospitality_support_customer_id text,
  add column if not exists hospitality_support_ticket_number text,
  add column if not exists category text not null default 'other',
  add column if not exists status_internal text not null default 'active',
  add column if not exists priority text,
  add column if not exists related_property_id uuid references public.properties(id) on delete set null,
  add column if not exists related_subscription_id uuid references public.subscriptions(id) on delete set null,
  add column if not exists related_invoice_id uuid references public.invoices(id) on delete set null,
  add column if not exists related_appointment_id uuid references public.service_bookings(id) on delete set null,
  add column if not exists related_payment_id uuid references public.payments(id) on delete set null,
  add column if not exists assigned_department text,
  add column if not exists preferred_contact_method text,
  add column if not exists contact_phone text,
  add column if not exists next_expected_action text,
  add column if not exists resolution_summary text,
  add column if not exists last_message_at timestamptz,
  add column if not exists last_customer_message_at timestamptz,
  add column if not exists last_support_message_at timestamptz,
  add column if not exists customer_unread_count integer not null default 0,
  add column if not exists latest_sender text,
  add column if not exists integration_status text not null default 'pending',
  add column if not exists creation_idempotency_key text,
  add column if not exists resolved_at timestamptz,
  add column if not exists closed_at timestamptz;

update public.support_requests
set public_reference = 'DT-' || to_char(created_at, 'YYYY') || '-' ||
  lpad(nextval('public.support_reference_seq')::text, 6, '0')
where public_reference is null;

update public.support_requests
set external_reference = 'DT-SUPPORT-' || customer_id::text || '-' || id::text
where external_reference is null;

update public.support_requests
set last_message_at = coalesce(last_message_at, updated_at, created_at),
    last_customer_message_at = coalesce(last_customer_message_at, created_at),
    integration_status = case
      when hospitality_support_conversation_id is null then 'legacy'
      else integration_status
    end;

alter table public.support_requests
  alter column public_reference set default (
    'DT-' || to_char(current_date, 'YYYY') || '-' ||
    lpad(nextval('public.support_reference_seq')::text, 6, '0')
  ),
  alter column public_reference set not null,
  alter column external_reference set not null;

alter table public.support_requests add constraint support_requests_public_reference_key unique (public_reference);
alter table public.support_requests add constraint support_requests_external_reference_key unique (external_reference);
alter table public.support_requests add constraint support_requests_hospitality_conversation_key unique (hospitality_support_conversation_id);
alter table public.support_requests add constraint support_requests_creation_idempotency_key unique (customer_id, creation_idempotency_key);
alter table public.support_requests add constraint support_requests_status_check
  check (status in ('open', 'waiting_support', 'waiting_customer', 'in_progress', 'resolved', 'closed'));
alter table public.support_requests add constraint support_requests_category_check
  check (category in ('cleaning_service','subscription','appointment','invoice','payment','key_management','smart_lock','property_details','employee_feedback','damage_missing_item','complaint','technical_issue','account_access','other'));
alter table public.support_requests add constraint support_requests_priority_check
  check (priority is null or priority in ('low','normal','high','urgent'));
alter table public.support_requests add constraint support_requests_integration_status_check
  check (integration_status in ('pending','synced','retry_pending','failed','unavailable','legacy'));
alter table public.support_requests add constraint support_requests_latest_sender_check
  check (latest_sender is null or latest_sender in ('customer','support','system','call'));

create index if not exists support_requests_customer_activity_idx
  on public.support_requests(customer_id, last_message_at desc);
create index if not exists support_requests_external_conversation_idx
  on public.support_requests(hospitality_support_conversation_id)
  where hospitality_support_conversation_id is not null;
create index if not exists support_requests_customer_status_idx
  on public.support_requests(customer_id, status, last_message_at desc);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  support_request_id uuid not null references public.support_requests(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  hospitality_support_message_id text not null,
  entry_type text not null check (entry_type in ('customer','support','system','call')),
  visibility text not null default 'customer' check (visibility in ('customer','internal')),
  sender_name text,
  sender_role text,
  body text not null,
  attachment_metadata jsonb not null default '[]'::jsonb,
  call_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null default now(),
  unique (support_request_id, hospitality_support_message_id)
);

insert into public.support_messages (
  support_request_id, customer_id, hospitality_support_message_id,
  entry_type, visibility, sender_name, sender_role, body, created_at
)
select id, customer_id, 'legacy-' || id::text, 'customer', 'customer',
  'Customer', 'Customer', message, created_at
from public.support_requests
where message is not null and btrim(message) <> ''
on conflict (support_request_id, hospitality_support_message_id) do nothing;

create index if not exists support_messages_request_time_idx
  on public.support_messages(support_request_id, created_at);
create index if not exists support_messages_customer_idx
  on public.support_messages(customer_id, support_request_id);

create table if not exists public.support_attachments (
  id uuid primary key default gen_random_uuid(),
  support_request_id uuid not null references public.support_requests(id) on delete cascade,
  support_message_id uuid references public.support_messages(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  hospitality_support_attachment_id text,
  storage_path text,
  external_url text,
  original_filename text not null,
  safe_filename text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','application/pdf','text/plain','video/mp4')),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  visibility text not null default 'customer' check (visibility in ('customer','internal')),
  created_at timestamptz not null default now(),
  check (storage_path is not null or external_url is not null),
  unique (support_request_id, hospitality_support_attachment_id)
);

create index if not exists support_attachments_request_idx
  on public.support_attachments(support_request_id, created_at);

create table if not exists public.support_reply_submissions (
  id uuid primary key default gen_random_uuid(),
  support_request_id uuid not null references public.support_requests(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  idempotency_key text not null,
  message_sha256 text not null,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  hospitality_support_message_id text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (support_request_id, idempotency_key)
);

create table if not exists public.support_sync_events (
  id uuid primary key default gen_random_uuid(),
  external_event_id text not null unique,
  event_type text not null,
  support_request_id uuid references public.support_requests(id) on delete set null,
  processing_status text not null default 'received' check (processing_status in ('received','processed','ignored','retry_pending','failed')),
  correlation_id text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text
);

create index if not exists support_sync_events_retry_idx
  on public.support_sync_events(processing_status, received_at)
  where processing_status in ('received','retry_pending');

create table if not exists public.support_notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  support_request_id uuid not null references public.support_requests(id) on delete cascade,
  hospitality_support_message_id text not null,
  notification_type text not null default 'support_reply',
  safe_summary text,
  delivery_status text not null default 'portal_unread' check (delivery_status in ('portal_unread','queued','sent','failed','read')),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  read_at timestamptz,
  unique (support_request_id, hospitality_support_message_id, notification_type)
);

create index if not exists support_notifications_customer_unread_idx
  on public.support_notifications(customer_id, created_at desc)
  where read_at is null;

create or replace function public.increment_support_unread(p_support_request_id uuid, p_count integer)
returns integer
language sql
security invoker
set search_path = ''
as $$
  update public.support_requests
  set customer_unread_count = customer_unread_count + greatest(p_count, 0)
  where id = p_support_request_id
  returning customer_unread_count;
$$;

revoke all on function public.increment_support_unread(uuid, integer) from public, anon, authenticated;
grant execute on function public.increment_support_unread(uuid, integer) to service_role;

drop trigger if exists support_requests_set_updated_at on public.support_requests;
create trigger support_requests_set_updated_at
before update on public.support_requests
for each row execute function private.set_updated_at();

drop trigger if exists support_reply_submissions_set_updated_at on public.support_reply_submissions;
create trigger support_reply_submissions_set_updated_at
before update on public.support_reply_submissions
for each row execute function private.set_updated_at();

alter table public.support_messages enable row level security;
alter table public.support_attachments enable row level security;
alter table public.support_reply_submissions enable row level security;
alter table public.support_sync_events enable row level security;
alter table public.support_notifications enable row level security;

revoke all on table public.support_messages, public.support_attachments,
  public.support_reply_submissions, public.support_sync_events,
  public.support_notifications from anon, authenticated;
revoke insert, update, delete on table public.support_requests from authenticated;

grant select, insert, update, delete on table public.support_requests,
  public.support_messages, public.support_attachments,
  public.support_reply_submissions, public.support_sync_events,
  public.support_notifications to service_role;

-- Explicit Data API exposure for customer-readable tables. Writes are handled
-- by server routes using the secret key and additional ownership validation.
grant select on table public.support_requests, public.support_messages,
  public.support_attachments, public.support_notifications to authenticated;

drop policy if exists support_read_own on public.support_requests;
create policy support_read_own on public.support_requests for select to authenticated
using (customer_id in (
  select id from public.customers where auth_user_id = (select auth.uid())
));

drop policy if exists support_insert_own on public.support_requests;

create policy support_messages_read_own on public.support_messages for select to authenticated
using (
  visibility = 'customer' and customer_id in (
    select id from public.customers where auth_user_id = (select auth.uid())
  )
);

create policy support_attachments_read_own on public.support_attachments for select to authenticated
using (
  visibility = 'customer' and customer_id in (
    select id from public.customers where auth_user_id = (select auth.uid())
  )
);

create policy support_notifications_read_own on public.support_notifications for select to authenticated
using (customer_id in (
  select id from public.customers where auth_user_id = (select auth.uid())
));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('support-attachments', 'support-attachments', false, 10485760,
  array['image/jpeg','image/png','image/webp','application/pdf','text/plain','video/mp4'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists support_storage_read_own on storage.objects;
create policy support_storage_read_own on storage.objects for select to authenticated
using (
  bucket_id = 'support-attachments' and
  (storage.foldername(name))[1] = (select auth.uid())::text
);

notify pgrst, 'reload schema';
