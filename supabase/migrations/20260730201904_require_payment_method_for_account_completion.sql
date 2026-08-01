-- An account is complete only after Stripe has confirmed that a reusable
-- payment method belongs to the customer's Stripe customer.
alter table public.customers
  add column if not exists payment_method_ready_at timestamptz,
  add column if not exists account_completed_at timestamptz;

create or replace function private.sync_customer_account_completion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.stripe_customer_id is null or new.payment_method_ready_at is null then
    new.account_completed_at := null;
  elsif new.account_completed_at is null then
    new.account_completed_at := now();
  end if;
  return new;
end;
$$;

revoke all on function private.sync_customer_account_completion()
  from public, anon, authenticated;
grant execute on function private.sync_customer_account_completion()
  to service_role;

drop trigger if exists customers_sync_account_completion on public.customers;
create trigger customers_sync_account_completion
before insert or update of stripe_customer_id, payment_method_ready_at,
  account_completed_at on public.customers
for each row execute function private.sync_customer_account_completion();

-- Preserve verified payment methods already captured by assessment Checkout.
with verified_payment_method as (
  select distinct on (assessment.customer_id)
    assessment.customer_id,
    assessment.stripe_customer_id,
    coalesce(
      assessment.paid_at,
      assessment.confirmed_at,
      assessment.created_at
    ) as ready_at
  from public.home_assessments assessment
  where assessment.stripe_payment_method_id is not null
    and assessment.stripe_customer_id is not null
  order by assessment.customer_id,
    coalesce(
      assessment.paid_at,
      assessment.confirmed_at,
      assessment.created_at
    ) desc
)
update public.customers customer
set
  stripe_customer_id = coalesce(
    customer.stripe_customer_id,
    verified_payment_method.stripe_customer_id
  ),
  payment_method_ready_at = coalesce(
    customer.payment_method_ready_at,
    verified_payment_method.ready_at
  )
from verified_payment_method
where customer.id = verified_payment_method.customer_id
  and (
    customer.stripe_customer_id is null
    or customer.stripe_customer_id = verified_payment_method.stripe_customer_id
  );

alter table public.customers
  drop constraint if exists customers_completed_account_requires_payment_method;
alter table public.customers
  add constraint customers_completed_account_requires_payment_method
  check (
    account_completed_at is null
    or (
      stripe_customer_id is not null
      and payment_method_ready_at is not null
    )
  );

comment on column public.customers.payment_method_ready_at is
  'Set only after Stripe verifies a reusable payment method for this customer.';
comment on column public.customers.account_completed_at is
  'Automatically set when verified payment details make the account complete.';
