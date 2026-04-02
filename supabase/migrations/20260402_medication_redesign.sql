-- Medication module redesign: expand medicines, prescriptions, prescription_items

-- 1. Expand medicines table
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS strength TEXT;
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS route TEXT;
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS therapeutic_group TEXT;

-- 2. Expand prescriptions table
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS duplicated_from_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL;

-- 3. Expand prescription_items table
ALTER TABLE public.prescription_items ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.prescription_items ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.prescription_items ADD COLUMN IF NOT EXISTS continuous BOOLEAN DEFAULT FALSE;
