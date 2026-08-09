-- The operational `properties` table has no coordinates (selected_latitude/
-- selected_longitude live on the unrelated marketing `cleaning_properties`
-- lead table). service_visits is owned by this feature, so we store the
-- visit location directly here rather than touching the older properties table.
alter table public.service_visits
  add column if not exists lat numeric(9, 6),
  add column if not exists lng numeric(9, 6);
