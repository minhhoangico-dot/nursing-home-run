-- Free-form resident attachments, up to 5 files per resident and 10 MB per file.

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = NULL
WHERE id = 'resident-documents';

CREATE TABLE IF NOT EXISTS public.resident_other_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id text NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL UNIQUE,
  file_size bigint NOT NULL CHECK (file_size <= 10485760),
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resident_other_documents_resident_id
  ON public.resident_other_documents(resident_id, created_at);

ALTER TABLE public.resident_other_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access resident other documents" ON public.resident_other_documents;

CREATE POLICY "Public access resident other documents"
  ON public.resident_other_documents FOR ALL TO public
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.enforce_resident_other_documents_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (
    SELECT count(*)
    FROM public.resident_other_documents
    WHERE resident_id = NEW.resident_id
  ) >= 5 THEN
    RAISE EXCEPTION 'A resident can have at most 5 other documents';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS resident_other_documents_limit ON public.resident_other_documents;

CREATE TRIGGER resident_other_documents_limit
  BEFORE INSERT ON public.resident_other_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_resident_other_documents_limit();
