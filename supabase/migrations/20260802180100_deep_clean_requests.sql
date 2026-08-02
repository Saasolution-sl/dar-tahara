-- Deep-clean add-on workflow. One deep clean is free for 12-month
-- subscribers (once per contract, tracked via subscriptions.deep_clean_free_used);
-- every other request is paid, priced at double the property's once-per-month
-- rate (see src/lib/deep-clean-pricing.ts).

alter table public.subscriptions
  add column if not exists deep_clean_free_used boolean not null default false;

create table if not exists public.deep_clean_requests (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  requested_date date not null,
  is_free boolean not null default false,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'eur' check (char_length(currency) = 3),
  payment_status text not null default 'not_required'
    check (payment_status in ('not_required', 'pending', 'paid', 'failed')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  status text not null default 'submitted' check (status in
    ('submitted', 'under_review', 'approved', 'scheduled', 'completed', 'rejected', 'cancelled')),
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deep_clean_requests_customer_status_idx on public.deep_clean_requests(customer_id, status);
create index if not exists deep_clean_requests_subscription_idx on public.deep_clean_requests(subscription_id);
-- Only one non-terminal request may exist per subscription at a time.
create unique index if not exists deep_clean_requests_one_actionable_per_subscription_idx
  on public.deep_clean_requests(subscription_id)
  where status in ('submitted', 'under_review', 'approved', 'scheduled');

drop trigger if exists deep_clean_requests_set_updated_at on public.deep_clean_requests;
create trigger deep_clean_requests_set_updated_at before update on public.deep_clean_requests
for each row execute function private.set_updated_at();

alter table public.deep_clean_requests enable row level security;

revoke all on table public.deep_clean_requests from anon, authenticated;
grant select, insert, update, delete on table public.deep_clean_requests to service_role;
grant select, insert on table public.deep_clean_requests to authenticated;

create policy deep_clean_requests_read_own on public.deep_clean_requests for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));
create policy deep_clean_requests_insert_own on public.deep_clean_requests for insert to authenticated
with check (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));

notify pgrst, 'reload schema';
