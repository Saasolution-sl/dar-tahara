-- Subscription pause-request workflow (Phase 2 of the subscription-duration
-- project). Adds the request/approval table and its supporting-photo uploads,
-- mirroring assessment_attachments' shape and RLS exactly for the latter.

create table if not exists public.pause_requests (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  reason_category text not null check (reason_category in
    ('construction', 'major_renovation', 'property_damage', 'inaccessible', 'other')),
  reason_description text not null,
  requested_start_date date not null,
  requested_end_date date not null check (requested_end_date > requested_start_date),
  approved_start_date date,
  approved_end_date date check (approved_end_date is null or approved_start_date is null or approved_end_date > approved_start_date),
  status text not null default 'submitted' check (status in
    ('submitted', 'under_review', 'approved', 'rejected', 'cancelled', 'active', 'completed')),
  admin_notes text,
  customer_visible_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pause_request_attachments (
  id uuid primary key default gen_random_uuid(),
  pause_request_id uuid not null references public.pause_requests(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists pause_requests_customer_status_idx on public.pause_requests(customer_id, status);
create index if not exists pause_requests_subscription_idx on public.pause_requests(subscription_id);
-- Only one non-terminal request may exist per subscription at a time.
create unique index if not exists pause_requests_one_actionable_per_subscription_idx
  on public.pause_requests(subscription_id)
  where status in ('submitted', 'under_review', 'approved', 'active');
create index if not exists pause_request_attachments_request_idx on public.pause_request_attachments(pause_request_id, created_at desc);

drop trigger if exists pause_requests_set_updated_at on public.pause_requests;
create trigger pause_requests_set_updated_at before update on public.pause_requests
for each row execute function private.set_updated_at();

alter table public.pause_requests enable row level security;
alter table public.pause_request_attachments enable row level security;

revoke all on table public.pause_requests, public.pause_request_attachments from anon, authenticated;

grant select, insert, update, delete on table public.pause_requests, public.pause_request_attachments to service_role;

grant select, insert on table public.pause_requests to authenticated;
grant select, insert on table public.pause_request_attachments to authenticated;

create policy pause_requests_read_own on public.pause_requests for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));
create policy pause_requests_insert_own on public.pause_requests for insert to authenticated
with check (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));

create policy pause_request_attachments_read_own on public.pause_request_attachments for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));
create policy pause_request_attachments_insert_own on public.pause_request_attachments for insert to authenticated
with check (
  uploaded_by = (select auth.uid()) and
  customer_id in (select id from public.customers where auth_user_id = (select auth.uid()))
);

-- Private pause-request upload bucket, same folder-scoping convention as
-- assessment-attachments: object paths must begin with the uploader's auth UUID.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('pause-request-attachments', 'pause-request-attachments', false, 10485760,
  array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists pause_request_storage_insert_own on storage.objects;
create policy pause_request_storage_insert_own on storage.objects for insert to authenticated
with check (
  bucket_id = 'pause-request-attachments' and
  (storage.foldername(name))[1] = (select auth.uid())::text
);
drop policy if exists pause_request_storage_read_own on storage.objects;
create policy pause_request_storage_read_own on storage.objects for select to authenticated
using (
  bucket_id = 'pause-request-attachments' and
  ((storage.foldername(name))[1] = (select auth.uid())::text or
   (select private.current_user_has_role(array['staff','administrator'])))
);

notify pgrst, 'reload schema';
