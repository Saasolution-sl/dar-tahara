-- Store the ISO 3166-1 alpha-2 country chosen in the phone selector.
--
-- The E.164 number already encodes the calling code, but a calling code is not
-- a country (+1 is the US, Canada and ~20 others; +212 covers Western Sahara).
-- Keeping the explicit ISO code makes segmentation and per-country validation
-- unambiguous, and lets us re-validate a stored number later against the rules
-- of the country the customer actually selected.

alter table public.marketing_leads
  add column if not exists phone_country text
    check (phone_country is null or char_length(phone_country) = 2);

comment on column public.marketing_leads.phone_country is
  'ISO 3166-1 alpha-2 of the country selected in the phone input. The flag is never stored.';
