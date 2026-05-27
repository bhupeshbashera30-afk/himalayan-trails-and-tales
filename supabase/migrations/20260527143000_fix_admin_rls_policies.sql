-- Make admin checks stable for dashboard queries.
-- Run this in Supabase SQL Editor if the deployed database has not run migrations automatically.

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

DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings_2025_10_14_17_34;
CREATE POLICY "Admins can read all bookings"
  ON public.bookings_2025_10_14_17_34 FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings_2025_10_14_17_34;
CREATE POLICY "Admins can update bookings"
  ON public.bookings_2025_10_14_17_34 FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can read contact submissions" ON public.contact_submissions_2025_10_14_17_34;
CREATE POLICY "Admins can read contact submissions"
  ON public.contact_submissions_2025_10_14_17_34 FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions_2025_10_14_17_34;
CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions_2025_10_14_17_34 FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories_2025_10_14_17_34;
CREATE POLICY "Admins can manage categories"
  ON public.categories_2025_10_14_17_34 FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage destinations" ON public.destinations_2025_10_14_17_34;
CREATE POLICY "Admins can manage destinations"
  ON public.destinations_2025_10_14_17_34 FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages_2025_10_14_17_34;
CREATE POLICY "Admins can manage packages"
  ON public.packages_2025_10_14_17_34 FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can read profiles" ON public.profiles_2025_10_14_17_34;
CREATE POLICY "Admins can read profiles"
  ON public.profiles_2025_10_14_17_34 FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all treks" ON public.treks;
CREATE POLICY "Admins can read all treks"
  ON public.treks FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert treks" ON public.treks;
CREATE POLICY "Admins can insert treks"
  ON public.treks FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update treks" ON public.treks;
CREATE POLICY "Admins can update treks"
  ON public.treks FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete treks" ON public.treks;
CREATE POLICY "Admins can delete treks"
  ON public.treks FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view trek registrations" ON public.trek_registrations;
CREATE POLICY "Admins can view trek registrations"
  ON public.trek_registrations FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update trek registrations" ON public.trek_registrations;
CREATE POLICY "Admins can update trek registrations"
  ON public.trek_registrations FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can read admin users" ON public.admin_users;
CREATE POLICY "Admins can read admin users"
  ON public.admin_users FOR SELECT
  USING (public.is_admin());
