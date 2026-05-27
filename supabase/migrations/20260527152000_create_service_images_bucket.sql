-- Storage bucket for admin-uploaded service images.
-- Run after 20260527143000_fix_admin_rls_policies.sql so public.is_admin() exists.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can read service images" ON storage.objects;
CREATE POLICY "Public can read service images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-images');

DROP POLICY IF EXISTS "Admins can upload service images" ON storage.objects;
CREATE POLICY "Admins can upload service images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'service-images'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update service images" ON storage.objects;
CREATE POLICY "Admins can update service images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'service-images'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'service-images'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete service images" ON storage.objects;
CREATE POLICY "Admins can delete service images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'service-images'
    AND public.is_admin()
  );
