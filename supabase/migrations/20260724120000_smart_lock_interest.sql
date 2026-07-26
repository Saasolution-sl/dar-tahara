-- Digital smart-lock upsell — capture the customer's product INTEREST during
-- early access. This is never a paid order: no charge is made here and
-- installation is always subject to a later door/lock compatibility review.
--
-- Columns live on property_access_preferences (one access profile per property),
-- extending the existing model rather than introducing a duplicate table.
-- The stored price/currency snapshot the offer the customer was actually shown,
-- so a later price change cannot retroactively alter historic interest records.

alter table public.property_access_preferences
  add column if not exists smart_lock_interest text
    check (smart_lock_interest is null or smart_lock_interest in
      ('purchase_interested','already_has_lock','not_interested')),
  add column if not exists smart_lock_product_code text,
  add column if not exists smart_lock_offer_price numeric(10,2)
    check (smart_lock_offer_price is null or smart_lock_offer_price >= 0),
  add column if not exists smart_lock_offer_currency text
    check (smart_lock_offer_currency is null or char_length(smart_lock_offer_currency) = 3),
  add column if not exists smart_lock_installation_included boolean,
  add column if not exists existing_lock_brand text,
  add column if not exists existing_lock_model text,
  add column if not exists smart_lock_compatibility_status text
    check (smart_lock_compatibility_status is null or smart_lock_compatibility_status in
      ('not_checked','pending_review','compatible','not_compatible')),
  add column if not exists smart_lock_followup_status text
    check (smart_lock_followup_status is null or smart_lock_followup_status in
      ('no_action_required','information_requested','compatibility_review_required',
       'installation_interest_registered','contact_attempted','assessment_required',
       'compatible','not_compatible','quote_or_order_pending','completed')),
  add column if not exists smart_lock_selected_at timestamptz;

-- Lets operators pull the smart-lock follow-up queue without scanning every row.
create index if not exists property_access_smart_lock_followup_idx
  on public.property_access_preferences (smart_lock_followup_status)
  where smart_lock_followup_status is not null
    and smart_lock_followup_status <> 'no_action_required';

comment on column public.property_access_preferences.smart_lock_interest is
  'Customer product interest only — NOT a paid order. Price/currency snapshot the shown offer.';
