-- Replace the early-access applicant's country-of-residence field with their
-- city in Morocco. Keep existing country values under an explicitly legacy
-- column so the migration does not destroy previously collected information.

alter table public.marketing_leads
  rename column residence_country to residence_country_legacy;

alter table public.marketing_leads
  add column residence_city text
    check (residence_city is null or char_length(btrim(residence_city)) between 1 and 120);

comment on column public.marketing_leads.residence_country_legacy is
  'Deprecated country-of-residence value retained for historical submissions.';

comment on column public.marketing_leads.residence_city is
  'Selected Moroccan city or a visitor-supplied city when Other was chosen.';

create index marketing_leads_residence_city_idx
  on public.marketing_leads (residence_city)
  where residence_city is not null;
