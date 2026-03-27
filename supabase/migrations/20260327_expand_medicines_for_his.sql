ALTER TABLE public.medicines
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS trade_name TEXT,
ADD COLUMN IF NOT EXISTS route TEXT,
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN IF NOT EXISTS his_service_id BIGINT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.medicines
SET source = 'MANUAL'
WHERE source IS NULL;

CREATE INDEX IF NOT EXISTS idx_medicines_code ON public.medicines (code);
CREATE INDEX IF NOT EXISTS idx_medicines_source ON public.medicines (source);
