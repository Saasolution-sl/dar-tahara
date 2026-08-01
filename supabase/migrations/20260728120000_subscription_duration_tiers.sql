-- Subscription-duration pricing tiers (3/6/9/12 months, 0/5/10/15% discount).
-- Admin-configurable, mirroring feature_flags: seeded defaults, service_role
-- writes, public read of enabled rows only (the calculator needs this
-- unauthenticated, before a customer signs in or is even a lead).

create table if not exists public.subscription_duration_tiers (
  code text primary key check (code ~ '^[a-z0-9_]{3,20}$'),
  months smallint not null check (months in (3, 6, 9, 12)),
  discount_basis_points integer not null default 0 check (discount_basis_points between 0 and 10000),
  pause_eligible boolean not null default false,
  max_pause_months smallint not null default 0 check (max_pause_months >= 0),
  max_pauses_per_contract smallint not null default 0 check (max_pauses_per_contract >= 0),
  enabled boolean not null default true,
  display_order smallint not null default 0,
  recommended boolean not null default false,
  effective_from timestamptz not null default now(),
  effective_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (months),
  constraint duration_tiers_effective_range_check check (effective_until is null or effective_until > effective_from)
);

insert into public.subscription_duration_tiers
  (code, months, discount_basis_points, pause_eligible, max_pause_months, max_pauses_per_contract, enabled, display_order, recommended)
values
  ('3_month', 3, 0, false, 0, 0, true, 0, false),
  ('6_month', 6, 500, false, 0, 0, true, 1, false),
  ('9_month', 9, 1000, true, 2, 1, true, 2, false),
  ('12_month', 12, 1500, true, 2, 1, true, 3, true)
on conflict (code) do nothing;

drop trigger if exists duration_tiers_set_updated_at on public.subscription_duration_tiers;
create trigger duration_tiers_set_updated_at before update on public.subscription_duration_tiers
for each row execute function private.set_updated_at();

alter table public.subscription_duration_tiers enable row level security;

revoke all on table public.subscription_duration_tiers from anon, authenticated;
grant select, insert, update, delete on table public.subscription_duration_tiers to service_role;
grant select on table public.subscription_duration_tiers to anon, authenticated;

create policy duration_tiers_read_enabled on public.subscription_duration_tiers for select
to anon, authenticated
using (enabled);

notify pgrst, 'reload schema';
