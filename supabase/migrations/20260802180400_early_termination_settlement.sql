-- Early-termination settlements and prepaid-term renewal state.
--
-- `subscriptions.billing_interval` is the existing authoritative billing
-- method: monthly = monthly paid, annual = fully prepaid. Historical rows are
-- not guessed or rewritten.

-- Duration-tier benefit metadata used by both the portal and settlement
-- benefit-recovery policy.
alter table public.subscription_duration_tiers
  add column if not exists includes_free_deep_clean boolean not null default false;
update public.subscription_duration_tiers
set includes_free_deep_clean = true
where code = '12_month';

-- Subscription state. The immutable original duration remains in
-- contract_duration_months/original_term_code; the replacement term exists
-- only on the calculation and audit link.
alter table public.subscriptions drop constraint if exists subscriptions_operational_status_check;
alter table public.subscriptions add constraint subscriptions_operational_status_check
  check (operational_status in ('active', 'suspended_for_non_payment', 'cancellation_pending'));

alter table public.subscriptions
  add column if not exists cancellation_status text
    check (cancellation_status is null or cancellation_status in ('requested', 'confirmed', 'settled', 'voided')),
  add column if not exists cancellation_requested_at timestamptz,
  add column if not exists cancellation_effective_at timestamptz,
  add column if not exists termination_reason text,
  add column if not exists original_term_code text references public.subscription_duration_tiers(code),
  add column if not exists auto_renew boolean not null default true,
  add column if not exists renewal_payment_due_at timestamptz,
  add column if not exists renewal_status text
    check (renewal_status is null or renewal_status in ('payment_requested', 'paid', 'disabled', 'expired')),
  add column if not exists renewal_invoice_id uuid references public.invoices(id) on delete set null,
  add column if not exists next_term_start timestamptz,
  add column if not exists next_term_end timestamptz;

update public.subscriptions
set auto_renew = not cancel_at_period_end
where auto_renew is distinct from (not cancel_at_period_end);

create index if not exists subscriptions_cancellation_status_idx
  on public.subscriptions(cancellation_status)
  where cancellation_status is not null;
create index if not exists subscriptions_prepaid_renewal_due_idx
  on public.subscriptions(current_period_end, renewal_status)
  where billing_interval = 'annual' and status = 'active' and auto_renew;

-- A persisted immutable quote. All explanatory financial fields are first
-- class columns as well as being retained in the complete JSON snapshot.
create table if not exists public.early_termination_calculations (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  original_term_code text not null references public.subscription_duration_tiers(code),
  replacement_term_code text not null references public.subscription_duration_tiers(code),
  completed_months integer not null check (completed_months >= 0),
  current_contract_month integer not null check (current_contract_month >= 1),
  original_monthly_amount_cents integer not null check (original_monthly_amount_cents >= 0),
  replacement_monthly_amount_cents integer not null check (replacement_monthly_amount_cents >= 0),
  amount_previously_paid_cents integer not null check (amount_previously_paid_cents >= 0),
  recalculated_consumed_amount_cents integer not null check (recalculated_consumed_amount_cents >= 0),
  discount_correction_cents integer not null,
  remaining_minimum_months integer not null check (remaining_minimum_months >= 0),
  remaining_minimum_term_amount_cents integer not null check (remaining_minimum_term_amount_cents >= 0),
  payments_allocated_to_remaining_term_cents integer not null default 0
    check (payments_allocated_to_remaining_term_cents >= 0),
  included_invoice_outstanding_cents integer not null default 0
    check (included_invoice_outstanding_cents >= 0),
  included_invoice_ids uuid[] not null default '{}'::uuid[],
  additional_charges_cents integer not null default 0 check (additional_charges_cents >= 0),
  deep_clean_recovery_cents integer not null default 0 check (deep_clean_recovery_cents >= 0),
  credits_cents integer not null default 0 check (credits_cents >= 0),
  settlement_payments_received_cents integer not null default 0
    check (settlement_payments_received_cents >= 0),
  raw_total_cents integer not null,
  total_cents integer not null check (total_cents >= 0),
  credit_review_required boolean not null default false,
  currency text not null default 'eur' check (char_length(currency) = 3),
  pricing_snapshot jsonb not null,
  calculation_snapshot jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'review_required', 'accepted', 'expired', 'superseded', 'settled', 'defaulted')),
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  terms_version text,
  settlement_invoice_id uuid references public.invoices(id) on delete set null,
  settlement_reminder_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists early_termination_calculations_subscription_idx
  on public.early_termination_calculations(subscription_id, created_at desc);
create unique index if not exists early_termination_calculations_one_open_idx
  on public.early_termination_calculations(subscription_id)
  where status in ('pending', 'review_required', 'accepted');
create unique index if not exists early_termination_calculations_settlement_invoice_idx
  on public.early_termination_calculations(settlement_invoice_id)
  where settlement_invoice_id is not null;

alter table public.subscriptions
  add column if not exists termination_calculation_id uuid
    references public.early_termination_calculations(id) on delete set null;

-- Settlement and renewal invoices remain normal invoice rows but are
-- explicitly classified. Existing `is_final_settlement` is retained for
-- compatibility during deployment; invoice_type is authoritative.
alter table public.invoices drop constraint if exists invoices_status_check;
alter table public.invoices add constraint invoices_status_check
  check (status in (
    'draft', 'open', 'paid', 'overdue', 'void', 'refunded',
    'partially_refunded', 'uncollectible', 'included_in_settlement'
  ));

alter table public.invoices
  add column if not exists invoice_type text not null default 'standard'
    check (invoice_type in ('standard', 'early_termination_settlement', 'prepaid_renewal')),
  add column if not exists is_final_settlement boolean not null default false,
  add column if not exists early_termination_calculation_id uuid
    references public.early_termination_calculations(id) on delete restrict,
  add column if not exists included_in_settlement_id uuid
    references public.early_termination_calculations(id) on delete set null,
  add column if not exists invoice_details jsonb,
  add column if not exists renewal_term_start timestamptz,
  add column if not exists renewal_term_end timestamptz;

create unique index if not exists invoices_one_early_termination_settlement_idx
  on public.invoices(early_termination_calculation_id);
create index if not exists invoices_included_in_settlement_idx
  on public.invoices(included_in_settlement_id)
  where included_in_settlement_id is not null;
create index if not exists invoices_type_idx on public.invoices(invoice_type, created_at desc);
create unique index if not exists invoices_one_prepaid_renewal_per_term_idx
  on public.invoices(subscription_id, invoice_type, renewal_term_start);

-- Payment links and payment-attempt audit records also classify prepaid
-- renewal collection.
alter table public.payment_links drop constraint if exists payment_links_link_type_check;
alter table public.payment_links add constraint payment_links_link_type_check
  check (link_type in ('first_notice', 'second_notice', 'final_settlement', 'prepaid_renewal'));

alter table public.payment_attempts drop constraint if exists payment_attempts_attempt_type_check;
alter table public.payment_attempts add constraint payment_attempts_attempt_type_check
  check (attempt_type in (
    'initial', 'stripe_retry', 'manual_admin_retry', 'payment_link',
    'final_settlement', 'prepaid_renewal'
  ));

-- Server-configurable timing and settlement policy.
alter table public.billing_policy_settings
  add column if not exists cancellation_preview_window_hours integer not null default 48
    check (cancellation_preview_window_hours >= 1),
  add column if not exists final_settlement_payment_window_days integer not null default 14
    check (final_settlement_payment_window_days >= 1),
  add column if not exists prepaid_renewal_lead_days integer not null default 30
    check (prepaid_renewal_lead_days between 1 and 90),
  add column if not exists unpaid_settlement_action text not null default 'continue_contract'
    check (unpaid_settlement_action in ('continue_contract', 'terminate_and_escalate', 'manual_review')),
  add column if not exists stop_services_immediately boolean not null default true,
  add column if not exists deep_clean_recovery_enabled boolean not null default true,
  add column if not exists early_termination_enabled boolean not null default true;

alter table public.early_termination_calculations enable row level security;

revoke all on table public.early_termination_calculations from anon, authenticated;
grant select, insert, update, delete on table public.early_termination_calculations to service_role;
grant select on table public.early_termination_calculations to authenticated;

create policy early_termination_calculations_read_own
on public.early_termination_calculations
for select
to authenticated
using (
  customer_id in (
    select id
    from public.customers
    where auth_user_id = (select auth.uid())
  )
);

notify pgrst, 'reload schema';
