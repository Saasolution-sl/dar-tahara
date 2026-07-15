-- Add the missing referred_by_code column to marketing_leads.
--
-- A referred visitor signs up via /early-access?ref=CODE. The application stores
-- that raw code on the lead at submit time (buildLeadRow → referred_by_code) and
-- resolves it to the referrer only after the referred lead verifies their email
-- (referral-service). The original early-access migration modelled only the
-- resolved referred_by_lead_id and omitted the text column the code path writes,
-- so a referred signup would fail on insert. This adds it.

alter table public.marketing_leads
  add column if not exists referred_by_code text;

-- Speeds up the "who did this code refer" checks and keeps referral reporting fast.
create index if not exists marketing_leads_referred_by_code_idx
  on public.marketing_leads (referred_by_code)
  where referred_by_code is not null;
