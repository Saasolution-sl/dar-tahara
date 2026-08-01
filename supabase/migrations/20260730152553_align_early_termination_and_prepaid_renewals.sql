-- Forward-only alignment for projects that already applied the original
-- 20260730120000 settlement migration before its implementation was expanded.
-- All changes are additive/backfilled and preserve the legacy calculation and
-- invoice columns for historical compatibility.

alter table public.subscription_proposals
  add column if not exists pricing_snapshot jsonb,
  add column if not exists pricing_version text;

alter table public.subscriptions
  add column if not exists termination_reason text,
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

alter table public.early_termination_calculations
  add column if not exists replacement_term_code text
    references public.subscription_duration_tiers(code),
  add column if not exists completed_months integer,
  add column if not exists current_contract_month integer,
  add column if not exists original_monthly_amount_cents integer,
  add column if not exists replacement_monthly_amount_cents integer,
  add column if not exists amount_previously_paid_cents integer,
  add column if not exists recalculated_consumed_amount_cents integer,
  add column if not exists remaining_minimum_term_amount_cents integer,
  add column if not exists payments_allocated_to_remaining_term_cents integer default 0,
  add column if not exists included_invoice_outstanding_cents integer default 0,
  add column if not exists included_invoice_ids uuid[] default '{}'::uuid[],
  add column if not exists additional_charges_cents integer default 0,
  add column if not exists settlement_payments_received_cents integer default 0,
  add column if not exists raw_total_cents integer,
  add column if not exists credit_review_required boolean default false,
  add column if not exists pricing_snapshot jsonb,
  add column if not exists confirmed_at timestamptz;

-- The original live table used elapsed/reclassified/remaining-charge column
-- names. Backfill only when those legacy columns exist; a fresh database that
-- already has the final schema safely skips this block.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'early_termination_calculations'
      and column_name = 'elapsed_months'
  ) then
    execute $migration$
      update public.early_termination_calculations c
      set
        replacement_term_code = coalesce(c.replacement_term_code, c.reclassified_term_code),
        completed_months = coalesce(c.completed_months, c.elapsed_months),
        current_contract_month = coalesce(c.current_contract_month, c.elapsed_months + 1),
        original_monthly_amount_cents = coalesce(
          c.original_monthly_amount_cents,
          nullif(c.calculation_snapshot ->> 'originalMonthlyCents', '')::integer,
          s.monthly_price_cents
        ),
        replacement_monthly_amount_cents = coalesce(
          c.replacement_monthly_amount_cents,
          nullif(c.calculation_snapshot ->> 'replacementMonthlyCents', '')::integer,
          nullif(c.calculation_snapshot ->> 'reclassifiedMonthlyCents', '')::integer,
          s.monthly_price_cents
        ),
        recalculated_consumed_amount_cents = coalesce(
          c.recalculated_consumed_amount_cents,
          c.elapsed_months * coalesce(
            nullif(c.calculation_snapshot ->> 'replacementMonthlyCents', '')::integer,
            nullif(c.calculation_snapshot ->> 'reclassifiedMonthlyCents', '')::integer,
            s.monthly_price_cents
          )
        ),
        amount_previously_paid_cents = coalesce(
          c.amount_previously_paid_cents,
          greatest(
            0,
            c.elapsed_months * coalesce(
              nullif(c.calculation_snapshot ->> 'replacementMonthlyCents', '')::integer,
              nullif(c.calculation_snapshot ->> 'reclassifiedMonthlyCents', '')::integer,
              s.monthly_price_cents
            ) - c.discount_correction_cents
          )
        ),
        remaining_minimum_term_amount_cents = coalesce(
          c.remaining_minimum_term_amount_cents,
          c.remaining_minimum_charge_cents
        ),
        payments_allocated_to_remaining_term_cents = coalesce(
          c.payments_allocated_to_remaining_term_cents,
          0
        ),
        included_invoice_outstanding_cents = greatest(
          coalesce(c.included_invoice_outstanding_cents, 0),
          coalesce(c.outstanding_invoice_total_cents, 0)
        ),
        included_invoice_ids = case
          when coalesce(cardinality(c.included_invoice_ids), 0) = 0 then array(
            select i.id
            from public.invoices i
            where i.included_in_settlement_id = c.id
          )
          else c.included_invoice_ids
        end,
        additional_charges_cents = coalesce(c.additional_charges_cents, 0),
        settlement_payments_received_cents = coalesce(
          c.settlement_payments_received_cents,
          0
        ),
        raw_total_cents = coalesce(c.raw_total_cents, c.total_cents),
        credit_review_required = coalesce(c.credit_review_required, false),
        pricing_snapshot = coalesce(
          c.pricing_snapshot,
          s.pricing_snapshot,
          jsonb_build_object(
            'pricingVersion', s.pricing_version,
            'legacyCalculation', true
          )
        ),
        confirmed_at = coalesce(c.confirmed_at, c.accepted_at),
        calculation_snapshot = c.calculation_snapshot || jsonb_build_object(
          'completedMonths', c.elapsed_months,
          'currentContractMonth', c.elapsed_months + 1,
          'replacementTier', coalesce(
            c.calculation_snapshot -> 'replacementTier',
            c.calculation_snapshot -> 'reclassifiedTier'
          ),
          'replacementMonthlyCents', coalesce(
            nullif(c.calculation_snapshot ->> 'replacementMonthlyCents', '')::integer,
            nullif(c.calculation_snapshot ->> 'reclassifiedMonthlyCents', '')::integer,
            s.monthly_price_cents
          ),
          'amountPreviouslyPaidCents', greatest(
            0,
            c.elapsed_months * coalesce(
              nullif(c.calculation_snapshot ->> 'replacementMonthlyCents', '')::integer,
              nullif(c.calculation_snapshot ->> 'reclassifiedMonthlyCents', '')::integer,
              s.monthly_price_cents
            ) - c.discount_correction_cents
          ),
          'recalculatedConsumedPeriodCents', c.elapsed_months * coalesce(
            nullif(c.calculation_snapshot ->> 'replacementMonthlyCents', '')::integer,
            nullif(c.calculation_snapshot ->> 'reclassifiedMonthlyCents', '')::integer,
            s.monthly_price_cents
          ),
          'remainingMinimumTermAmountCents', c.remaining_minimum_charge_cents,
          'paymentsAllocatedToRemainingTermCents', 0,
          'includedInvoiceOutstandingCents', c.outstanding_invoice_total_cents,
          'includedInvoiceIds', to_jsonb(array(
            select i.id
            from public.invoices i
            where i.included_in_settlement_id = c.id
          )),
          'additionalChargesCents', 0,
          'settlementPaymentsAlreadyReceivedCents', 0,
          'rawTotalCents', c.total_cents,
          'creditReviewRequired', false
        )
      from public.subscriptions s
      where s.id = c.subscription_id
    $migration$;
  end if;
end
$$;

alter table public.early_termination_calculations
  alter column replacement_term_code set not null,
  alter column completed_months set not null,
  alter column current_contract_month set not null,
  alter column original_monthly_amount_cents set not null,
  alter column replacement_monthly_amount_cents set not null,
  alter column amount_previously_paid_cents set not null,
  alter column recalculated_consumed_amount_cents set not null,
  alter column remaining_minimum_term_amount_cents set not null,
  alter column payments_allocated_to_remaining_term_cents set not null,
  alter column included_invoice_outstanding_cents set not null,
  alter column included_invoice_ids set not null,
  alter column additional_charges_cents set not null,
  alter column settlement_payments_received_cents set not null,
  alter column raw_total_cents set not null,
  alter column credit_review_required set not null,
  alter column pricing_snapshot set not null;

alter table public.early_termination_calculations
  drop constraint if exists early_termination_calculations_discount_correction_cents_check,
  drop constraint if exists early_termination_calculations_status_check;

alter table public.early_termination_calculations
  add constraint early_termination_calculations_completed_months_check
    check (completed_months >= 0),
  add constraint early_termination_calculations_current_contract_month_check
    check (current_contract_month >= 1),
  add constraint early_termination_calculations_original_monthly_amount_cents_check
    check (original_monthly_amount_cents >= 0),
  add constraint early_termination_calculations_replacement_monthly_amount_cents_check
    check (replacement_monthly_amount_cents >= 0),
  add constraint early_termination_calculations_amount_previously_paid_cents_check
    check (amount_previously_paid_cents >= 0),
  add constraint early_termination_calculations_recalculated_consumed_amount_cents_check
    check (recalculated_consumed_amount_cents >= 0),
  add constraint early_termination_calculations_remaining_minimum_term_amount_cents_check
    check (remaining_minimum_term_amount_cents >= 0),
  add constraint early_termination_calculations_payments_allocated_remaining_check
    check (payments_allocated_to_remaining_term_cents >= 0),
  add constraint early_termination_calculations_included_invoice_outstanding_check
    check (included_invoice_outstanding_cents >= 0),
  add constraint early_termination_calculations_additional_charges_check
    check (additional_charges_cents >= 0),
  add constraint early_termination_calculations_settlement_payments_check
    check (settlement_payments_received_cents >= 0),
  add constraint early_termination_calculations_status_check
    check (status in (
      'pending', 'review_required', 'accepted', 'expired',
      'superseded', 'settled', 'defaulted'
    ));

drop index if exists public.early_termination_calculations_one_open_idx;
create unique index early_termination_calculations_one_open_idx
  on public.early_termination_calculations(subscription_id)
  where status in ('pending', 'review_required', 'accepted');

create unique index if not exists early_termination_calculations_settlement_invoice_idx
  on public.early_termination_calculations(settlement_invoice_id)
  where settlement_invoice_id is not null;

alter table public.subscriptions
  add column if not exists termination_calculation_id uuid
    references public.early_termination_calculations(id) on delete set null;

update public.subscriptions s
set
  termination_reason = coalesce(s.termination_reason, 'customer_early_termination'),
  termination_calculation_id = c.id
from public.early_termination_calculations c
where c.subscription_id = s.id
  and c.status in ('accepted', 'settled')
  and s.termination_calculation_id is null;

alter table public.invoices
  add column if not exists invoice_type text not null default 'standard'
    check (invoice_type in ('standard', 'early_termination_settlement', 'prepaid_renewal')),
  add column if not exists early_termination_calculation_id uuid
    references public.early_termination_calculations(id) on delete restrict,
  add column if not exists invoice_details jsonb,
  add column if not exists renewal_term_start timestamptz,
  add column if not exists renewal_term_end timestamptz;

update public.invoices i
set
  invoice_type = 'early_termination_settlement',
  early_termination_calculation_id = c.id,
  invoice_details = coalesce(i.invoice_details, c.calculation_snapshot)
from public.early_termination_calculations c
where c.settlement_invoice_id = i.id;

update public.invoices
set invoice_type = 'early_termination_settlement'
where is_final_settlement
  and invoice_type = 'standard';

create unique index if not exists invoices_one_early_termination_settlement_idx
  on public.invoices(early_termination_calculation_id);
create index if not exists invoices_type_idx
  on public.invoices(invoice_type, created_at desc);
create unique index if not exists invoices_one_prepaid_renewal_per_term_idx
  on public.invoices(subscription_id, invoice_type, renewal_term_start);

alter table public.payment_links
  drop constraint if exists payment_links_link_type_check;
alter table public.payment_links
  add constraint payment_links_link_type_check
    check (link_type in ('first_notice', 'second_notice', 'final_settlement', 'prepaid_renewal'));

alter table public.payment_attempts
  drop constraint if exists payment_attempts_attempt_type_check;
alter table public.payment_attempts
  add constraint payment_attempts_attempt_type_check
    check (attempt_type in (
      'initial', 'stripe_retry', 'manual_admin_retry', 'payment_link',
      'final_settlement', 'prepaid_renewal'
    ));

alter table public.billing_policy_settings
  add column if not exists prepaid_renewal_lead_days integer not null default 30
    check (prepaid_renewal_lead_days between 1 and 90);

create index if not exists subscriptions_prepaid_renewal_due_idx
  on public.subscriptions(current_period_end, renewal_status)
  where billing_interval = 'annual' and status = 'active' and auto_renew;

grant select, insert, update, delete
  on table public.early_termination_calculations
  to service_role;
grant select
  on table public.early_termination_calculations
  to authenticated;

notify pgrst, 'reload schema';
