-- Operations Center dashboard: live visits/scheduling, staff live status,
-- quality inspections, complaints, inventory, AI-insight recommendations, and
-- per-user dashboard layout customization. None of this data existed before
-- (no field app / GPS source today), schema is built ahead of a future
-- mobile/field integration, seeded with demo data via scripts/seed-operations-data.ts.
--
-- Access pattern mirrors subscription_suspensions/payment_links: RLS enabled,
-- revoked from anon/authenticated, service_role only. All reads happen
-- server-side (serviceSelect) through requireRole-gated dashboard pages with
-- manual office_id filtering, not client-side RLS-filtered reads.

create table if not exists public.service_visits (
  id uuid primary key default gen_random_uuid(),
  office_id uuid references public.offices(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  assigned_staff_id uuid references public.staff_members(id) on delete set null,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  actual_start timestamptz,
  actual_end timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'driving', 'working', 'break', 'completed', 'delayed', 'cancelled')),
  travel_minutes integer check (travel_minutes is null or travel_minutes >= 0),
  cleaning_minutes integer check (cleaning_minutes is null or cleaning_minutes >= 0),
  customer_rating smallint check (customer_rating is null or customer_rating between 1 and 5),
  customer_feedback text,
  is_revisit boolean not null default false,
  revisit_of_visit_id uuid references public.service_visits(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_visits_office_scheduled_idx on public.service_visits(office_id, scheduled_start);
create index if not exists service_visits_staff_scheduled_idx on public.service_visits(assigned_staff_id, scheduled_start);
create index if not exists service_visits_customer_idx on public.service_visits(customer_id, scheduled_start desc);
create index if not exists service_visits_status_idx on public.service_visits(status, scheduled_start);

create table if not exists public.staff_live_status (
  staff_id uuid primary key references public.staff_members(id) on delete cascade,
  office_id uuid references public.offices(id) on delete set null,
  status text not null default 'offline'
    check (status in ('working', 'driving', 'break', 'waiting', 'finished', 'sick', 'offline')),
  current_visit_id uuid references public.service_visits(id) on delete set null,
  next_visit_id uuid references public.service_visits(id) on delete set null,
  lat numeric(9, 6),
  lng numeric(9, 6),
  updated_at timestamptz not null default now()
);

create index if not exists staff_live_status_office_idx on public.staff_live_status(office_id);

create table if not exists public.quality_inspections (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.service_visits(id) on delete cascade,
  inspector_staff_id uuid references public.staff_members(id) on delete set null,
  score numeric(5, 2) not null check (score between 0 and 100),
  first_time_right boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists quality_inspections_visit_idx on public.quality_inspections(visit_id);

create table if not exists public.customer_complaints (
  id uuid primary key default gen_random_uuid(),
  office_id uuid references public.offices(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  visit_id uuid references public.service_visits(id) on delete set null,
  category text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  is_recurring boolean not null default false,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists customer_complaints_office_status_idx on public.customer_complaints(office_id, status);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  office_id uuid references public.offices(id) on delete set null,
  category text not null check (category in ('cleaning_products', 'uniforms', 'equipment', 'vehicle_supplies')),
  name text not null,
  quantity integer not null default 0 check (quantity >= 0),
  unit text not null default 'unit',
  reorder_threshold integer not null default 0 check (reorder_threshold >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_items_office_idx on public.inventory_items(office_id);

create table if not exists public.inventory_restock_requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  office_id uuid references public.offices(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  quantity_requested integer not null check (quantity_requested > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'fulfilled')),
  created_at timestamptz not null default now()
);

create index if not exists inventory_restock_requests_office_idx on public.inventory_restock_requests(office_id, status);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  office_id uuid references public.offices(id) on delete set null,
  category text not null check (category in (
    'churn_risk', 'staff_overload', 'route_optimization', 'complaint_trend', 'quality_drop',
    'top_performer', 'expansion_opportunity', 'supply_shortage', 'payment_risk', 'inactive_customer'
  )),
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  title text not null,
  description text not null,
  related_customer_id uuid references public.customers(id) on delete set null,
  related_staff_id uuid references public.staff_members(id) on delete set null,
  created_at timestamptz not null default now(),
  dismissed_at timestamptz
);

create index if not exists ai_insights_office_created_idx on public.ai_insights(office_id, created_at desc);

create table if not exists public.dashboard_layouts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dashboard_key text not null default 'operations',
  widgets jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.service_visits enable row level security;
alter table public.staff_live_status enable row level security;
alter table public.quality_inspections enable row level security;
alter table public.customer_complaints enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_restock_requests enable row level security;
alter table public.ai_insights enable row level security;
alter table public.dashboard_layouts enable row level security;

revoke all on table
  public.service_visits, public.staff_live_status, public.quality_inspections,
  public.customer_complaints, public.inventory_items, public.inventory_restock_requests,
  public.ai_insights, public.dashboard_layouts
from anon, authenticated;

grant select, insert, update, delete on table
  public.service_visits, public.staff_live_status, public.quality_inspections,
  public.customer_complaints, public.inventory_items, public.inventory_restock_requests,
  public.ai_insights, public.dashboard_layouts
to service_role;
