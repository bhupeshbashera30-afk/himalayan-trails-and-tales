-- ============================================================
-- STEP 1: Run this FIRST in Supabase SQL Editor
-- Creates: treks, trek_registrations, admin_users tables
-- ============================================================

-- Treks table (upcoming/active treks managed by admin)
CREATE TABLE IF NOT EXISTS public.treks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  start_date DATE,
  end_date DATE,
  price DECIMAL(10,2),
  difficulty VARCHAR(50) DEFAULT 'moderate',
  max_seats INTEGER DEFAULT 20,
  seats_booked INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]',
  highlights JSONB DEFAULT '[]',
  is_upcoming BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trek registration interest table
CREATE TABLE IF NOT EXISTS public.trek_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trek_id UUID REFERENCES public.treks(id) ON DELETE CASCADE,
  trek_name VARCHAR(200),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  num_people INTEGER DEFAULT 1,
  message TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(200),
  full_name VARCHAR(200),
  is_admin BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- RLS for new tables only
-- ============================================================
ALTER TABLE public.treks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public can read active treks
CREATE POLICY "Public can read active treks"
  ON public.treks FOR SELECT
  USING (is_active = true);

-- Anyone can register interest for a trek
CREATE POLICY "Anyone can register trek interest"
  ON public.trek_registrations FOR INSERT
  WITH CHECK (true);

-- Admin can read all treks (including inactive)
CREATE POLICY "Admins can read all treks"
  ON public.treks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can insert treks
CREATE POLICY "Admins can insert treks"
  ON public.treks FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can update treks
CREATE POLICY "Admins can update treks"
  ON public.treks FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can delete treks
CREATE POLICY "Admins can delete treks"
  ON public.treks FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can view trek registrations
CREATE POLICY "Admins can view trek registrations"
  ON public.trek_registrations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can update trek registrations (change status)
CREATE POLICY "Admins can update trek registrations"
  ON public.trek_registrations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin users can read their own record
CREATE POLICY "Admin users can read own record"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = id);

-- ============================================================
-- Sample trek data
-- ============================================================
INSERT INTO public.treks (name, description, location, start_date, end_date, price, difficulty, max_seats, images, highlights, is_upcoming, is_active)
VALUES
(
  'Kedarkantha Trek',
  'A stunning winter trek to the Kedarkantha summit at 12,500 ft offering panoramic views of the Garhwal Himalayas. Perfect for beginners and experienced trekkers alike.',
  'Sankri, Uttarakhand',
  '2026-12-20',
  '2026-12-27',
  8500,
  'easy',
  20,
  '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"]',
  '["Summit views at 12,500 ft", "Snow-covered trails", "Camping under stars", "Oak and rhododendron forests"]',
  true,
  true
),
(
  'Valley of Flowers Trek',
  'UNESCO World Heritage site trek through the breathtaking Valley of Flowers, blooming with over 500 species of wildflowers against the backdrop of snow-capped peaks.',
  'Govindghat, Uttarakhand',
  '2026-07-15',
  '2026-07-22',
  12000,
  'moderate',
  15,
  '["https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop"]',
  '["500+ species of wildflowers", "UNESCO Heritage site", "Hemkund Sahib visit", "Nanda Devi views"]',
  true,
  true
),
(
  'Roopkund Trek',
  'The mystery lake trek — trek to the glacial lake at 16,500 ft famously known for the skeletal remains discovered around it. An epic high-altitude adventure.',
  'Lohajung, Uttarakhand',
  '2026-09-05',
  '2026-09-13',
  15000,
  'hard',
  12,
  '["https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop"]',
  '["Mystery skeleton lake", "16,500 ft altitude", "Ali Bugyal meadows", "360° Himalayan views"]',
  true,
  true
);
