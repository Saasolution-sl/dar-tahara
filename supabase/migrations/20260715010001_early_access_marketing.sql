-- Early-access marketing system — structured system of record.
--
-- This is the Supabase half of the Dar Tahara ↔ Mautic architecture: Mautic owns
-- the marketing data (contacts, campaigns, scoring, engagement); these tables own
-- the structured application data that must NOT live only as Mautic contact
-- fields — exact billing/property addresses, coordinates, entry notes,
-- per-property service preferences, consent audit trail, campaign-source registry
-- and the referral graph.
--
-- Security model: every table below is written EXCLUSIVELY by the Next.js server
-- using the service-role key, which bypasses RLS. Public visitors reach the data
-- only through validated server routes, never the Data API directly. So RLS is
-- enabled on every table with NO anon/authenticated policies — a deny-by-default
-- posture. `revoke all ... from anon, authenticated` makes that explicit even if
-- a policy is added carelessly later.

create schema if not exists private;

-- Reused updated_at helper (matches the assessment-workflow migration).
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── marketing_leads ────────────────────────────────────────────────────────────
-- One row per early-access applicant. The hub the other tables hang off, and the
-- record that maps 1:1 to a Mautic contact via mautic_contact_id.
create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),

  -- Mautic linkage. Null until the (possibly deferred/retried) sync succeeds.
  mautic_contact_id bigint unique,
  mautic_sync_status text not null default 'pending'
    check (mautic_sync_status in
      ('pending','processing','synchronized','failed','retry_scheduled','permanently_failed')),
  mautic_sync_attempts smallint not null default 0,
  mautic_synced_at timestamptz,
  mautic_last_error text,

  -- Campaign attribution (the source that first brought this lead in). The FK to
  -- campaign_sources is added lower down, after that table is created — declaring
  -- it inline here would fail because the referenced table does not exist yet.
  campaign_source_id uuid,

  -- Identity / contact.
  first_name text not null check (char_length(first_name) between 1 and 120),
  last_name  text not null check (char_length(last_name) between 1 and 120),
  email text not null,
  -- Canonical, deduplicated email. The UNIQUE index on this is what makes Mautic
  -- sync idempotent: one lead per normalized address, no matter how many times
  -- the form is resubmitted.
  normalized_email text not null,
  mobile_phone text,      -- E.164 where derivable
  whatsapp_phone text,    -- E.164 where derivable
  preferred_contact_method text not null default 'whatsapp'
    check (preferred_contact_method in ('email','whatsapp','telephone')),
  preferred_language text not null default 'en'
    check (preferred_language in ('en','nl','fr','ar','es','de','pt')),
  residence_country text check (residence_country is null or char_length(residence_country) = 2),

  -- Lifecycle.
  status text not null default 'pending'
    check (status in ('pending','verified','qualified','waitlisted','invited','customer','archived')),
  email_verified_at timestamptz,

  -- Referral graph. referral_code is this lead's own shareable code; referred_by
  -- points at the lead who referred them.
  referral_code text unique,
  referred_by_lead_id uuid references public.marketing_leads(id) on delete set null,
  verified_referral_count integer not null default 0 check (verified_referral_count >= 0),

  -- Attribution: first-touch is written once and never overwritten; last-touch is
  -- refreshed on every visit. Kept separate per brief §27.
  first_source_code text,
  last_source_code text,
  first_utm_source text,
  first_utm_medium text,
  first_utm_campaign text,
  first_utm_content text,
  first_utm_term text,
  last_utm_source text,
  last_utm_medium text,
  last_utm_campaign text,
  last_utm_content text,
  last_utm_term text,

  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A lead can never be their own referrer.
  constraint marketing_leads_no_self_referral
    check (referred_by_lead_id is null or referred_by_lead_id <> id)
);

create unique index if not exists marketing_leads_normalized_email_key
  on public.marketing_leads (normalized_email);
create index if not exists marketing_leads_sync_status_idx
  on public.marketing_leads (mautic_sync_status)
  where mautic_sync_status in ('pending','failed','retry_scheduled');
create index if not exists marketing_leads_referred_by_idx
  on public.marketing_leads (referred_by_lead_id);
create index if not exists marketing_leads_status_idx
  on public.marketing_leads (status);

-- ── campaign_sources ───────────────────────────────────────────────────────────
-- The registry that maps an opaque src= code (e.g. wa_tng_001) to a human label
-- ("Tangier property-owners WhatsApp group"). The website can capture the code
-- but can never know the real group name, so it is recorded here once by staff.
create table if not exists public.campaign_sources (
  id uuid primary key default gen_random_uuid(),
  internal_name text not null,
  source_code text not null unique,
  source_channel text,   -- whatsapp | facebook | instagram | tiktok | telegram | email | qr | sms | partner | influencer | ...
  source_type text,      -- group | community | status | dm | post | ad | flyer | event | ...
  responsible_person text,
  partner_name text,
  influencer_name text,
  city text,
  region text,
  target_audience text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  campaign_cost numeric(12,2),
  cost_currency text default 'EUR' check (cost_currency is null or char_length(cost_currency) = 3),
  status text not null default 'active' check (status in ('active','inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists campaign_sources_status_idx on public.campaign_sources (status);

-- Deferred the marketing_leads → campaign_sources FK until campaign_sources
-- exists (declared inline above via forward reference; Postgres resolves it at
-- statement end within the same transaction, but add it explicitly to be safe
-- across partial re-runs).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'marketing_leads_campaign_source_fk'
  ) then
    alter table public.marketing_leads
      add constraint marketing_leads_campaign_source_fk
      foreign key (campaign_source_id) references public.campaign_sources(id) on delete set null;
  end if;
end
$$;

-- ── billing_profiles ───────────────────────────────────────────────────────────
-- Customer-account / invoicing address. May be anywhere in the world; do not
-- force Moroccan formatting. Never a payment-card address — no card data here.
create table if not exists public.billing_profiles (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketing_leads(id) on delete cascade,
  recipient_type text not null default 'private'
    check (recipient_type in ('private','business')),
  billing_first_name text,
  billing_last_name text,
  company_name text,
  address_line_1 text,
  address_line_2 text,
  building_number text,
  unit text,
  postal_code text,
  city text,
  region text,
  country_code text check (country_code is null or char_length(country_code) = 2),
  tax_id text,
  invoice_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists billing_profiles_lead_idx on public.billing_profiles (lead_id);

-- ── cleaning_properties ────────────────────────────────────────────────────────
-- The physical Moroccan property to be serviced. Stored separately from billing
-- even when the visitor ticks "use billing address as property address", and
-- modelled one-to-many so a customer can register multiple properties later.
create table if not exists public.cleaning_properties (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketing_leads(id) on delete cascade,
  property_name text,
  address_line_1 text,
  address_line_2 text,
  residence_name text,
  building_number text,
  unit_number text,
  floor text,
  postal_code text,
  city text,
  region text,
  neighbourhood text,
  country_code text not null default 'MA' check (char_length(country_code) = 2),
  landmark text,
  google_maps_url text,
  latitude numeric(9,6) check (latitude is null or latitude between -90 and 90),
  longitude numeric(9,6) check (longitude is null or longitude between -180 and 180),
  entry_notes text,
  property_type text
    check (property_type is null or property_type in
      ('apartment','house','villa','holiday_home','short_term_rental','riad','office','other')),
  size_m2 numeric(7,2) check (size_m2 is null or size_m2 >= 0),
  bedrooms smallint check (bedrooms is null or bedrooms between 0 and 50),
  bathrooms numeric(4,1) check (bathrooms is null or bathrooms between 0 and 50),
  kitchens smallint check (kitchens is null or kitchens between 0 and 20),
  living_rooms smallint check (living_rooms is null or living_rooms between 0 and 20),
  number_of_floors smallint check (number_of_floors is null or number_of_floors between 0 and 50),
  property_floor text,
  elevator_status text
    check (elevator_status is null or elevator_status in ('yes','no','unknown')),
  outdoor_area text
    check (outdoor_area is null or outdoor_area in
      ('none','balcony','terrace','garden','courtyard','multiple')),
  occupancy_type text
    check (occupancy_type is null or occupancy_type in
      ('primary_residence','secondary_residence','holiday_home','short_term_rental','long_term_rental','empty')),
  property_condition text
    check (property_condition is null or property_condition in
      ('maintained','standard','empty_a_while','deep_clean','renovation_dust','unsure')),
  furnishing_status text
    check (furnishing_status is null or furnishing_status in
      ('fully_furnished','partially_furnished','unfurnished')),
  pets_present boolean,
  smoking_status text
    check (smoking_status is null or smoking_status in ('yes','no','unknown')),
  authorized_by_submitter boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cleaning_properties_lead_idx on public.cleaning_properties (lead_id);
create index if not exists cleaning_properties_city_idx on public.cleaning_properties (city);

-- ── lead_service_preferences ───────────────────────────────────────────────────
-- Service demand, per property. service_types is an array so multiple services
-- can be selected without a join table at this stage.
create table if not exists public.lead_service_preferences (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketing_leads(id) on delete cascade,
  property_id uuid references public.cleaning_properties(id) on delete cascade,
  service_types text[] not null default '{}',
  desired_frequency text
    check (desired_frequency is null or desired_frequency in
      ('one_time','weekly','biweekly','monthly','before_arrival','after_departure','on_demand','not_sure')),
  expected_start_period text
    check (expected_start_period is null or expected_start_period in
      ('asap','within_1_month','within_3_months','within_6_months','later','no_fixed_date')),
  preferred_start_date date,
  additional_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists lead_service_preferences_lead_idx on public.lead_service_preferences (lead_id);

-- ── property_access_preferences ────────────────────────────────────────────────
create table if not exists public.property_access_preferences (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.cleaning_properties(id) on delete cascade,
  access_method text
    check (access_method is null or access_method in
      ('digital_lock','physical_key','person_present','concierge','lockbox','property_manager','other')),
  has_digital_lock boolean,
  -- Set true only when the visitor ticks the physical-key acknowledgement.
  physical_key_terms_acknowledged boolean not null default false,
  third_party_details text,
  access_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists property_access_preferences_property_idx
  on public.property_access_preferences (property_id);

-- ── lead_consents ──────────────────────────────────────────────────────────────
-- Append-only audit trail. Operational-communication consent and optional
-- marketing consent are recorded as SEPARATE rows (brief §16) — never merged.
-- Withdrawal is a new row with granted=false, so history is preserved.
create table if not exists public.lead_consents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketing_leads(id) on delete cascade,
  consent_type text not null
    check (consent_type in ('privacy_policy','operational_comms','marketing','accuracy','authorization')),
  granted boolean not null,
  policy_version text,
  locale text,
  source text,       -- e.g. early_access_form
  request_metadata jsonb,   -- privacy-safe only: coarse UA, hashed IP — never raw PII
  created_at timestamptz not null default now()
);
create index if not exists lead_consents_lead_type_idx on public.lead_consents (lead_id, consent_type);

-- ── referral_events ────────────────────────────────────────────────────────────
-- The referral graph's event log: a visit or signup attributed to a referral
-- code. A referral only counts once the referred lead verifies their email
-- (status advances to 'verified'), which is enforced in application logic.
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referrer_lead_id uuid not null references public.marketing_leads(id) on delete cascade,
  referred_lead_id uuid references public.marketing_leads(id) on delete set null,
  referral_code text not null,
  event_type text not null check (event_type in ('visit','signup','verified')),
  status text not null default 'pending' check (status in ('pending','counted','rejected')),
  created_at timestamptz not null default now(),
  -- A referred lead can be counted at most once per event_type for a referrer.
  constraint referral_events_no_self
    check (referred_lead_id is null or referred_lead_id <> referrer_lead_id)
);
create index if not exists referral_events_referrer_idx on public.referral_events (referrer_lead_id);
create unique index if not exists referral_events_unique_verified
  on public.referral_events (referrer_lead_id, referred_lead_id, event_type)
  where referred_lead_id is not null;

-- ── email_verification_tokens ──────────────────────────────────────────────────
-- Only the HASH of the token is stored, never the token itself, so a database
-- read cannot be used to verify anyone's email. Single-use + expiring.
create table if not exists public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketing_leads(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists email_verification_tokens_lead_idx
  on public.email_verification_tokens (lead_id);
-- Supports resend-throttling ("how many tokens issued to this lead recently").
create index if not exists email_verification_tokens_lead_created_idx
  on public.email_verification_tokens (lead_id, created_at desc);

-- ── updated_at triggers ────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'marketing_leads','campaign_sources','billing_profiles','cleaning_properties',
    'lead_service_preferences','property_access_preferences'
  ] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I;', t, t);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I '
      || 'for each row execute function private.set_updated_at();', t, t);
  end loop;
end
$$;

-- ── Row-level security: deny-by-default ────────────────────────────────────────
-- Enable RLS on every table and grant NOTHING to anon/authenticated. All access
-- is server-side via the service role, which bypasses RLS. This keeps exact
-- addresses, coordinates, entry notes, consent metadata and the referral graph
-- unreachable from the browser even if the Data API is probed directly.
do $$
declare t text;
begin
  foreach t in array array[
    'marketing_leads','campaign_sources','billing_profiles','cleaning_properties',
    'lead_service_preferences','property_access_preferences','lead_consents',
    'referral_events','email_verification_tokens'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
    -- The Data API roles only exist on a Supabase database; guard the revoke so
    -- this migration also applies cleanly on a plain Postgres (CI, local test).
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on table public.%I from anon;', t);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all on table public.%I from authenticated;', t);
    end if;
  end loop;
end
$$;
