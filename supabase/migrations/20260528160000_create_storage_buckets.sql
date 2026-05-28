-- 1. Create helper function for admin checks (in case it wasn't run earlier)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
      AND is_admin = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;


-- 2. Create the 'trek-images' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trek-images',
  'trek-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- 3. Create the 'service-images' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- 4. Enable policies on storage.objects for public reads
DROP POLICY IF EXISTS "Public can read trek images" ON storage.objects;
CREATE POLICY "Public can read trek images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trek-images');

DROP POLICY IF EXISTS "Public can read service images" ON storage.objects;
CREATE POLICY "Public can read service images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-images');


-- 5. Enable policies on storage.objects for admin uploads/updates/deletes
-- For 'trek-images'
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

-- For 'service-images'
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
