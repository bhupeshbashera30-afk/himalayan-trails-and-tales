-- ============================================================
-- STEP 2: Run this SECOND in Supabase SQL Editor
-- ONLY run after the original travel platform tables exist
-- (categories_2025_10_14_17_34, bookings_2025_10_14_17_34, etc.)
-- ============================================================

-- Admins can read ALL bookings
CREATE POLICY "Admins can read all bookings"
  ON public.bookings_2025_10_14_17_34 FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can update bookings (change status)
CREATE POLICY "Admins can update bookings"
  ON public.bookings_2025_10_14_17_34 FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can read all contact submissions
CREATE POLICY "Admins can read contact submissions"
  ON public.contact_submissions_2025_10_14_17_34 FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can update contact submissions (change status)
CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions_2025_10_14_17_34 FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON public.categories_2025_10_14_17_34 FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can manage destinations
CREATE POLICY "Admins can manage destinations"
  ON public.destinations_2025_10_14_17_34 FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can manage packages
CREATE POLICY "Admins can manage packages"
  ON public.packages_2025_10_14_17_34 FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================
-- After running this, create your admin user:
--
-- 1. Go to Supabase Dashboard → Authentication → Users → Invite User
-- 2. Enter your admin email and confirm
-- 3. Then run this query (replace email):
--
-- INSERT INTO public.admin_users (id, email, full_name, is_admin)
-- SELECT id, email, 'Admin User', true
-- FROM auth.users
-- WHERE email = 'your-admin-email@example.com';
--
-- ============================================================
