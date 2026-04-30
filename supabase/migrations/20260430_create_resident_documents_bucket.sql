-- Private Storage bucket for resident PII documents (CCCD, BHYT)
-- Read access only via signed URL.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resident-documents',
  'resident-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "auth read resident docs" ON storage.objects;
DROP POLICY IF EXISTS "auth write resident docs" ON storage.objects;
DROP POLICY IF EXISTS "auth update resident docs" ON storage.objects;
DROP POLICY IF EXISTS "auth delete resident docs" ON storage.objects;

CREATE POLICY "Public read resident docs"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'resident-documents');

CREATE POLICY "Public write resident docs"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'resident-documents');

CREATE POLICY "Public update resident docs"
  ON storage.objects FOR UPDATE TO public
  USING (bucket_id = 'resident-documents')
  WITH CHECK (bucket_id = 'resident-documents');

CREATE POLICY "Public delete resident docs"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'resident-documents');
