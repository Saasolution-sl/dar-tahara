-- Standardized Moroccan city taxonomy for the serviced property.
--
-- `city` keeps holding the canonical (or manual) display name for back-compat and
-- simple reporting. The new columns add the stable taxonomy id, region, the
-- service-area status at signup time, and — for the "my city is not listed"
-- path — an unverified manual name flagged for internal review. A non-active
-- service area never blocks a registration; it is recorded for launch comms.

alter table public.cleaning_properties
  add column if not exists city_id text,
  add column if not exists region_id text,
  add column if not exists manual_city_name text,
  add column if not exists service_area_status text
    check (service_area_status is null or service_area_status in
      ('active','planned','waiting_list','unsupported'));

-- Operators pull waiting-list / planned-area leads per city for launch planning.
create index if not exists cleaning_properties_service_area_idx
  on public.cleaning_properties (service_area_status)
  where service_area_status is not null and service_area_status <> 'active';
create index if not exists cleaning_properties_city_id_idx
  on public.cleaning_properties (city_id)
  where city_id is not null;

comment on column public.cleaning_properties.manual_city_name is
  'Unverified free-text city from the "not listed" path — for review, never auto-added to the canonical taxonomy.';
