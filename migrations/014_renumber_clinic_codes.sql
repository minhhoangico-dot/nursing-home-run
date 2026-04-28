-- 014_renumber_clinic_codes.sql
-- Renumber clinic_code for all residents to format YY-NNNN (e.g. 25-0001)
-- Sequence resets per admission year, sorted by admission_date ASC then id ASC.
-- After backfill, enforce NOT NULL + UNIQUE.

BEGIN;

WITH ordered AS (
    SELECT id,
           to_char(COALESCE(admission_date, created_at::date), 'YY') AS yy,
           ROW_NUMBER() OVER (
               PARTITION BY to_char(COALESCE(admission_date, created_at::date), 'YY')
               ORDER BY COALESCE(admission_date, created_at::date) ASC, id ASC
           ) AS seq
    FROM public.residents
)
UPDATE public.residents r
SET clinic_code = ordered.yy || '-' || lpad(ordered.seq::text, 4, '0'),
    updated_at = NOW()
FROM ordered
WHERE r.id = ordered.id;

ALTER TABLE public.residents
    ALTER COLUMN clinic_code SET NOT NULL;

ALTER TABLE public.residents
    ADD CONSTRAINT residents_clinic_code_unique UNIQUE (clinic_code);

COMMIT;
