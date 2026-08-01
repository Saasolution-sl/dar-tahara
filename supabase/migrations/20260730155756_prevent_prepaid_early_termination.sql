-- Early-termination repricing only applies to fixed-term subscriptions that
-- are billed monthly. A fully prepaid annual term is already paid for and
-- receives its prepayment discount in exchange for that commitment; it must
-- never produce a refund or an early-termination settlement invoice.

-- Record the repair before clearing the invalid cancellation state. Paid
-- settlement invoices are deliberately excluded from automatic cleanup and
-- require manual financial review.
insert into public.audit_logs (
  actor_user_id,
  action,
  resource_type,
  resource_id,
  previous_value,
  new_value
)
select
  null,
  'invalid_prepaid_early_termination_voided',
  'subscription',
  s.id::text,
  jsonb_build_object(
    'billing_interval', s.billing_interval,
    'cancellation_status', s.cancellation_status,
    'termination_reason', s.termination_reason,
    'termination_calculation_id', s.termination_calculation_id
  ),
  jsonb_build_object(
    'billing_interval', s.billing_interval,
    'cancellation_status', null,
    'termination_reason', null,
    'reason', 'prepaid_contracts_do_not_use_early_termination_settlements'
  )
from public.subscriptions s
join public.early_termination_calculations c
  on c.id = s.termination_calculation_id
where s.billing_interval = 'annual'
  and not exists (
    select 1
    from public.invoices paid_invoice
    where paid_invoice.early_termination_calculation_id = c.id
      and paid_invoice.amount_paid_cents > 0
  )
  and not exists (
    select 1
    from public.audit_logs existing_log
    where existing_log.action = 'invalid_prepaid_early_termination_voided'
      and existing_log.resource_type = 'subscription'
      and existing_log.resource_id = s.id::text
  );

update public.payment_links payment_link
set
  status = 'invalidated',
  invalidated_at = coalesce(payment_link.invalidated_at, now())
from public.invoices settlement_invoice
join public.subscriptions subscription
  on subscription.id = settlement_invoice.subscription_id
where payment_link.invoice_id = settlement_invoice.id
  and payment_link.status = 'active'
  and settlement_invoice.invoice_type = 'early_termination_settlement'
  and settlement_invoice.amount_paid_cents = 0
  and subscription.billing_interval = 'annual';

update public.invoices settlement_invoice
set status = 'void'
from public.subscriptions subscription
where subscription.id = settlement_invoice.subscription_id
  and subscription.billing_interval = 'annual'
  and settlement_invoice.invoice_type = 'early_termination_settlement'
  and settlement_invoice.amount_paid_cents = 0
  and settlement_invoice.status in ('draft', 'open', 'overdue', 'uncollectible');

update public.early_termination_calculations calculation
set status = 'superseded'
from public.subscriptions subscription
where subscription.id = calculation.subscription_id
  and subscription.billing_interval = 'annual'
  and calculation.status in (
    'pending',
    'review_required',
    'accepted',
    'expired',
    'defaulted'
  )
  and not exists (
    select 1
    from public.invoices paid_invoice
    where paid_invoice.early_termination_calculation_id = calculation.id
      and paid_invoice.amount_paid_cents > 0
  );

update public.subscriptions subscription
set
  cancellation_status = null,
  cancellation_requested_at = null,
  cancellation_effective_at = null,
  termination_reason = null,
  termination_calculation_id = null,
  cancelled_at = null,
  operational_status = 'active'
from public.early_termination_calculations calculation
where calculation.id = subscription.termination_calculation_id
  and subscription.billing_interval = 'annual'
  and not exists (
    select 1
    from public.invoices paid_invoice
    where paid_invoice.early_termination_calculation_id = calculation.id
      and paid_invoice.amount_paid_cents > 0
  );

create or replace function public.enforce_monthly_early_termination_calculation()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  subscription_billing_interval text;
begin
  select subscription.billing_interval
  into subscription_billing_interval
  from public.subscriptions subscription
  where subscription.id = new.subscription_id;

  if subscription_billing_interval is distinct from 'monthly' then
    raise exception
      'Early-termination calculations require a monthly-billed subscription'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists early_termination_calculations_monthly_only
  on public.early_termination_calculations;
create trigger early_termination_calculations_monthly_only
before insert or update of subscription_id
on public.early_termination_calculations
for each row
execute function public.enforce_monthly_early_termination_calculation();

create or replace function public.enforce_monthly_early_termination_invoice()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  subscription_billing_interval text;
begin
  if new.invoice_type <> 'early_termination_settlement' then
    return new;
  end if;

  select subscription.billing_interval
  into subscription_billing_interval
  from public.subscriptions subscription
  where subscription.id = new.subscription_id;

  if subscription_billing_interval is distinct from 'monthly' then
    raise exception
      'Early-termination settlement invoices require a monthly-billed subscription'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists invoices_early_termination_monthly_only
  on public.invoices;
create trigger invoices_early_termination_monthly_only
before insert or update of invoice_type, subscription_id
on public.invoices
for each row
execute function public.enforce_monthly_early_termination_invoice();

revoke all
  on function public.enforce_monthly_early_termination_calculation()
  from public, anon, authenticated;
revoke all
  on function public.enforce_monthly_early_termination_invoice()
  from public, anon, authenticated;
grant execute
  on function public.enforce_monthly_early_termination_calculation()
  to service_role;
grant execute
  on function public.enforce_monthly_early_termination_invoice()
  to service_role;

notify pgrst, 'reload schema';
