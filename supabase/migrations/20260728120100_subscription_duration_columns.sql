-- Additive columns for subscription-duration pricing and the pause benefit.
-- Everything here is nullable or defaulted so every existing row stays valid.
--
-- Legacy handling: pre-existing subscriptions/proposals predate this feature
-- entirely (open-ended monthly/annual billing, no fixed contract term), so
-- they explicitly get contract_duration_months = NULL ("no fixed term, not
-- a guess") rather than being backfilled to some assumed duration.
--
-- This migration adds columns only. The pause-REQUEST workflow (a
-- pause_requests table, approval flow, scheduling/billing suspension) is a
-- separate, later phase, these columns just give price-versioning and
-- pause-entitlement tracking somewhere to live.

alter table public.home_assessments
  add column if not exists requested_duration_months smallint
    check (requested_duration_months is null or requested_duration_months in (3, 6, 9, 12));

alter table public.subscription_proposals
  add column if not exists contract_duration_months smallint
    check (contract_duration_months is null or contract_duration_months in (3, 6, 9, 12)),
  add column if not exists duration_discount_basis_points integer not null default 0
    check (duration_discount_basis_points between 0 and 10000),
  add column if not exists price_before_duration_discount_cents integer
    check (price_before_duration_discount_cents is null or price_before_duration_discount_cents >= 0),
  add column if not exists minimum_contract_value_cents integer
    check (minimum_contract_value_cents is null or minimum_contract_value_cents >= 0),
  add column if not exists pause_eligible boolean not null default false,
  add column if not exists original_contract_end_date date,
  add column if not exists current_contract_end_date date,
  add column if not exists pricing_snapshot jsonb,
  add column if not exists pricing_version text;

alter table public.subscriptions
  add column if not exists contract_duration_months smallint
    check (contract_duration_months is null or contract_duration_months in (3, 6, 9, 12)),
  add column if not exists duration_discount_basis_points integer not null default 0
    check (duration_discount_basis_points between 0 and 10000),
  add column if not exists price_before_duration_discount_cents integer
    check (price_before_duration_discount_cents is null or price_before_duration_discount_cents >= 0),
  add column if not exists minimum_contract_value_cents integer
    check (minimum_contract_value_cents is null or minimum_contract_value_cents >= 0),
  add column if not exists pause_eligible boolean not null default false,
  add column if not exists pause_used boolean not null default false,
  add column if not exists pause_months_used integer not null default 0 check (pause_months_used >= 0),
  add column if not exists original_contract_end_date date,
  add column if not exists current_contract_end_date date,
  -- Full pricing snapshot at the moment the subscription was created, so a
  -- later change to subscription_duration_tiers never alters an existing
  -- customer's agreed price (spec: "price versioning").
  add column if not exists pricing_snapshot jsonb,
  add column if not exists pricing_version text,
  add column if not exists terms_version text;

notify pgrst, 'reload schema';
