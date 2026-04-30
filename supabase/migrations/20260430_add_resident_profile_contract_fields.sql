-- Persist resident identity, guardian, and contract fields captured by admission.

ALTER TABLE public.residents
  ADD COLUMN IF NOT EXISTS id_card text,
  ADD COLUMN IF NOT EXISTS guardian_address text,
  ADD COLUMN IF NOT EXISTS guardian_id_card text,
  ADD COLUMN IF NOT EXISTS guardian_relation text,
  ADD COLUMN IF NOT EXISTS contract_number text,
  ADD COLUMN IF NOT EXISTS contract_signed_date date,
  ADD COLUMN IF NOT EXISTS contract_monthly_fee numeric(12,2);
