-- KPI Baseline framework: the two genuinely new HR data domains needed by the
-- Personnel KPIs (Attendance, Sick Leave Monitoring, Employee Retention,
-- Employee Flow per City), everything else the KPI engine needs already
-- exists in service_visits/quality_inspections/customer_complaints/offices
-- from the Operations Center dashboard work.

alter table public.staff_members
  add column if not exists hire_date date,
  add column if not exists leave_date date;

create table if not exists public.staff_attendance (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_members(id) on delete cascade,
  office_id uuid references public.offices(id) on delete set null,
  date date not null,
  status text not null check (status in ('present', 'late', 'absent', 'no_show')),
  scheduled_start timestamptz,
  actual_start timestamptz,
  created_at timestamptz not null default now(),
  unique (staff_id, date)
);

create index if not exists staff_attendance_office_date_idx on public.staff_attendance(office_id, date);
create index if not exists staff_attendance_staff_date_idx on public.staff_attendance(staff_id, date);

create table if not exists public.staff_sick_leave (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_members(id) on delete cascade,
  office_id uuid references public.offices(id) on delete set null,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  created_at timestamptz not null default now()
);

create index if not exists staff_sick_leave_office_idx on public.staff_sick_leave(office_id, start_date);
create index if not exists staff_sick_leave_staff_idx on public.staff_sick_leave(staff_id, start_date);

alter table public.staff_attendance enable row level security;
alter table public.staff_sick_leave enable row level security;

revoke all on table public.staff_attendance, public.staff_sick_leave from anon, authenticated;
grant select, insert, update, delete on table public.staff_attendance, public.staff_sick_leave to service_role;

-- New AI-insight categories driven by the KPI engine (sickness trend, planner
-- inefficiency, recruitment needs) alongside the existing ones.
alter table public.ai_insights drop constraint if exists ai_insights_category_check;
alter table public.ai_insights add constraint ai_insights_category_check
  check (category in (
    'churn_risk', 'staff_overload', 'route_optimization', 'complaint_trend', 'quality_drop',
    'top_performer', 'expansion_opportunity', 'supply_shortage', 'payment_risk', 'inactive_customer',
    'sickness_trend', 'planner_inefficiency', 'recruitment_required'
  ));
