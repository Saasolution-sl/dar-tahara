alter table public.home_assessments
  add column if not exists doorlock_installation_requested boolean not null default false,
  add column if not exists doorlock_internet_confirmed boolean not null default false,
  add column if not exists doorlock_installation_price_cents integer not null default 0
    check (doorlock_installation_price_cents >= 0);

alter table public.home_assessments
  add constraint home_assessments_doorlock_internet_required
  check (
    doorlock_installation_requested = false
    or doorlock_internet_confirmed = true
  ) not valid;

alter table public.home_assessments
  validate constraint home_assessments_doorlock_internet_required;

notify pgrst, 'reload schema';
