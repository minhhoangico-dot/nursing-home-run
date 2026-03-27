ALTER TABLE public.medicines
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS trade_name TEXT,
ADD COLUMN IF NOT EXISTS route TEXT,
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN IF NOT EXISTS his_service_id BIGINT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'medicines_source_check'
          AND conrelid = 'public.medicines'::regclass
    ) THEN
        ALTER TABLE public.medicines
        ADD CONSTRAINT medicines_source_check
        CHECK (source IN ('HIS_IMPORT', 'MANUAL'));
    END IF;
END $$;

UPDATE public.medicines
SET
    source = COALESCE(source, 'MANUAL'),
    name = canonical.canonical_name
FROM (
    SELECT
        id,
        NULLIF(
            TRIM(
                CASE
                    WHEN NULLIF(BTRIM(active_ingredient), '') IS NOT NULL AND NULLIF(BTRIM(trade_name), '') IS NOT NULL
                        THEN BTRIM(active_ingredient) || ' (' || BTRIM(trade_name) || ')'
                    WHEN NULLIF(BTRIM(active_ingredient), '') IS NOT NULL
                        THEN BTRIM(active_ingredient)
                    WHEN NULLIF(BTRIM(trade_name), '') IS NOT NULL
                        THEN BTRIM(trade_name)
                    ELSE ''
                END
            ),
            ''
        ) AS canonical_name
    FROM public.medicines
) AS canonical
WHERE public.medicines.id = canonical.id
  AND (
      public.medicines.source IS NULL
      OR (
          canonical.canonical_name IS NOT NULL
          AND public.medicines.name IS DISTINCT FROM canonical.canonical_name
      )
  );

CREATE OR REPLACE FUNCTION public.set_medicines_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_medicines_updated_at ON public.medicines;

CREATE TRIGGER set_medicines_updated_at
BEFORE UPDATE ON public.medicines
FOR EACH ROW
EXECUTE FUNCTION public.set_medicines_updated_at();

CREATE INDEX IF NOT EXISTS idx_medicines_code ON public.medicines (code);
CREATE INDEX IF NOT EXISTS idx_medicines_source ON public.medicines (source);
