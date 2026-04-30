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
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "auth read resident docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resident-documents');

CREATE POLICY "auth write resident docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resident-documents');

CREATE POLICY "auth update resident docs"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resident-documents');

CREATE POLICY "auth delete resident docs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resident-documents');
