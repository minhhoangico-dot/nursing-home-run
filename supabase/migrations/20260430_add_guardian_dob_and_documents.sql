-- Admission expansion: guardian DOB + 5 document path columns

ALTER TABLE public.residents
  ADD COLUMN IF NOT EXISTS guardian_dob date,
  ADD COLUMN IF NOT EXISTS id_card_front_path text,
  ADD COLUMN IF NOT EXISTS id_card_back_path text,
  ADD COLUMN IF NOT EXISTS guardian_id_card_front_path text,
  ADD COLUMN IF NOT EXISTS guardian_id_card_back_path text,
  ADD COLUMN IF NOT EXISTS bhyt_card_path text;
