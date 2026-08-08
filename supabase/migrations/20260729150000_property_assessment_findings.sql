-- Assessment-findings fields for the customer portal's Properties table
-- (expandable row: m², AC units, access type, rooms, kitchens, living
-- spaces, outside spaces). Follows the existing declared_/verified_ pattern
-- already on this table for size/bedrooms/bathrooms, these are additional
-- staff-verified findings from the professional home assessment visit.

alter table public.properties
  add column if not exists air_conditioning_units smallint check (air_conditioning_units is null or air_conditioning_units >= 0),
  add column if not exists kitchen_count smallint check (kitchen_count is null or kitchen_count >= 0),
  add column if not exists living_space_count smallint check (living_space_count is null or living_space_count >= 0),
  add column if not exists outside_spaces text[] not null default '{}'::text[];

notify pgrst, 'reload schema';
