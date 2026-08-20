-- Extend the free annual deep-clean benefit to the 9-month tier.
--
-- 20260802180400_early_termination_settlement.sql added
-- subscription_duration_tiers.includes_free_deep_clean and granted it only to
-- the 12-month tier. Marketing is now surfacing this perk for both the 9- and
-- 12-month subscriptions, so eligibility must actually cover 9-month
-- contracts too, not just the marketing copy.
update public.subscription_duration_tiers
set includes_free_deep_clean = true
where code = '9_month';
