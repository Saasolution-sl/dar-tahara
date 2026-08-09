-- Demo appointments for the customer portal's /account/appointments view.
--
-- STAGING / LOCAL ONLY. Every row it writes is tagged with the marker below, so
-- re-running is safe (it deletes its own previous output first) and cleanup is:
--
--   with removed as (
--     delete from public.service_bookings
--     where notes = 'SEED:appointments-demo'
--     returning source_invoice_id
--   )
--   delete from public.invoices i using removed r where i.id = r.source_invoice_id;
--
-- Bookings must go first: source_invoice_id is ON DELETE RESTRICT.
--
-- `service_bookings.source_invoice_id` is NOT NULL and UNIQUE, so each booking
-- needs its own invoice - hence the throwaway invoices created alongside.
--
-- The customer, its properties, subscriptions and assessments must already
-- exist; this script resolves them by email rather than hardcoding UUIDs, and
-- raises a clear error if the chain is missing rather than half-seeding.

do $$
declare
  marker         constant text := 'SEED:appointments-demo';
  target_email   constant text := 'customer.test@dartahara.local';
  target_customer uuid;
  staff_a        uuid;
  today          date := current_date;
  chain          record;
  invoice_id     uuid;
  seeded         integer := 0;
  -- (day offset from today, status, exact time?, assign staff?)
  spec           record;
begin
  -- Same posture as scripts/verify-bundle-02-staging.ts: refuse to run unless
  -- the caller has explicitly declared a non-production target. Pass it with
  --   psql "$STAGING_DB_URL" -v ON_ERROR_STOP=1 \
  --     -c "set app.seed_target = 'staging'" -f this-file.sql
  if coalesce(current_setting('app.seed_target', true), '') <> 'staging' then
    raise exception
      'Refusing to seed: set app.seed_target = ''staging'' first. This script must never run against production.';
  end if;

  select id into target_customer
  from public.customers
  where email = target_email;

  if target_customer is null then
    raise exception 'No customer with email %. Seed the base customer data first.', target_email;
  end if;

  select id into staff_a from public.staff_members order by employee_number limit 1;

  -- Remove this script's previous output before re-seeding. Bookings first -
  -- source_invoice_id is ON DELETE RESTRICT - then the invoices they held.
  with removed as (
    delete from public.service_bookings
    where notes = marker
    returning source_invoice_id
  )
  delete from public.invoices i using removed r where i.id = r.source_invoice_id;

  -- Belt and braces for invoices whose booking was removed by hand.
  delete from public.invoices where invoice_number = marker;

  for chain in
    -- One chain per subscription; DISTINCT ON guards against a property that
    -- has been assessed more than once producing duplicate chains.
    select distinct on (s.id)
      s.id          as subscription_id,
      s.property_id as property_id,
      a.id          as assessment_id
    from public.subscriptions s
    join public.home_assessments a
      on a.property_id = s.property_id
     and a.customer_id = s.customer_id
    where s.customer_id = target_customer
    order by s.id, a.created_at desc
  loop
    for spec in
      select * from (values
        -- past, finished: exercises `completed` + the report card
        (-38, 'completed',   true,  true),
        -- past, still open: exercises `awaiting_update` (never "missed")
        (-11, 'confirmed',   false, true),
        -- happening now
        (  0, 'in_progress', true,  true),
        -- soon, exact slot known
        (  6, 'confirmed',   true,  true),
        -- further out, window only: exercises "time to be confirmed"
        ( 20, 'planning',    false, false),
        -- called off: exercises the muted `cancelled` treatment
        ( 27, 'cancelled',   false, false)
      ) as t(day_offset, status, exact_time, with_staff)
    loop
      insert into public.invoices (
        customer_id, subscription_id, status,
        amount_due_cents, amount_paid_cents, currency, invoice_number
      )
      values (target_customer, chain.subscription_id, 'paid', 4500, 4500, 'eur', marker)
      returning id into invoice_id;

      insert into public.service_bookings (
        customer_id, property_id, subscription_id, assessment_id, source_invoice_id,
        status, service_window_start, service_window_end,
        scheduled_start, scheduled_end, assigned_staff_id, notes
      )
      values (
        target_customer,
        chain.property_id,
        chain.subscription_id,
        chain.assessment_id,
        invoice_id,
        spec.status,
        today + spec.day_offset,
        today + spec.day_offset + 6,
        case when spec.exact_time
          then (today + spec.day_offset)::timestamptz + interval '9 hours'
        end,
        case when spec.exact_time
          then (today + spec.day_offset)::timestamptz + interval '11 hours 30 minutes'
        end,
        case when spec.with_staff then staff_a end,
        marker
      );

      seeded := seeded + 1;
    end loop;
  end loop;

  if seeded = 0 then
    raise exception
      'Customer % has no property/subscription/assessment chain to hang bookings on.', target_email;
  end if;

  raise notice 'Seeded % service_bookings for %.', seeded, target_email;
end $$;
