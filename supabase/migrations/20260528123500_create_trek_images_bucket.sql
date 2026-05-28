-- Storage bucket for admin-uploaded trek images.
-- Run after 20260527143000_fix_admin_rls_policies.sql so public.is_admin() exists.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trek-images',
  'trek-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can read trek images" ON storage.objects;
CREATE POLICY "Public can read trek images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trek-images');

DROP POLICY IF EXISTS "Admins can upload trek images" ON storage.objects;
CREATE POLICY "Admins can upload trek images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trek-images'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update trek images" ON storage.objects;
CREATE POLICY "Admins can update trek images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'trek-images'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'trek-images'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete trek images" ON storage.objects;
CREATE POLICY "Admins can delete trek images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'trek-images'
    AND public.is_admin()
  );
