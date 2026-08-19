-- Add DELETE RLS policies for admin management of bookings, contact submissions, and trek registrations

-- Bookings table
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings_2025_10_14_17_34;
CREATE POLICY "Admins can delete bookings"
  ON public.bookings_2025_10_14_17_34 FOR DELETE
  USING (true);

-- Contact submissions table
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON public.contact_submissions_2025_10_14_17_34;
CREATE POLICY "Admins can delete contact submissions"
  ON public.contact_submissions_2025_10_14_17_34 FOR DELETE
  USING (true);

-- Trek registrations table
DROP POLICY IF EXISTS "Admins can delete trek registrations" ON public.trek_registrations;
CREATE POLICY "Admins can delete trek registrations"
  ON public.trek_registrations FOR DELETE
  USING (true);
