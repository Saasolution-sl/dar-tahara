-- Confirmed operational location for the property.
--
-- `latitude`/`longitude` already hold the location we act on. These columns add
-- the provenance around it, which is what makes the pin trustworthy for
-- routing: where the address search originally put it, whether the customer
-- moved it, and how the final position was arrived at.
--
-- The distinction matters operationally. A geocoded result points at a postal
-- address; the pin the customer dragged points at the door the cleaner should
-- actually use. Those are frequently not the same place, a villa gate, a
-- residence side entrance, an unnamed lane.

alter table public.cleaning_properties
  add column if not exists selected_latitude numeric(9,6)
    check (selected_latitude is null or selected_latitude between -90 and 90),
  add column if not exists selected_longitude numeric(9,6)
    check (selected_longitude is null or selected_longitude between -180 and 180),
  add column if not exists pin_adjusted_by_customer boolean not null default false,
  add column if not exists location_source text
    check (location_source is null or location_source in
      ('google_place','map_pin','browser_geolocation','manual')),
  add column if not exists google_place_id text,
  add column if not exists formatted_address text,
  add column if not exists manual_address_entry boolean not null default false;

comment on column public.cleaning_properties.pin_adjusted_by_customer is
  'True when the customer moved the pin off the geocoded result, treat that position as authoritative for routing.';
comment on column public.cleaning_properties.location_source is
  'How the confirmed coordinates were obtained. "manual" means no Google result was used.';
