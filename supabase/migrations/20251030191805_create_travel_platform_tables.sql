/*
  # Create Travel Platform Tables

  1. New Tables
    - `categories_2025_10_14_17_34` - Categories for main menu items
      - `id` (uuid, primary key)
      - `name` (varchar)
      - `slug` (varchar, unique)
      - `description` (text)
      - `icon` (varchar)
      - `created_at` (timestamp)
    
    - `destinations_2025_10_14_17_34` - Destinations and services
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `name` (varchar)
      - `description` (text)
      - `location` (varchar)
      - `price_range` (varchar)
      - `images` (jsonb)
      - `features` (jsonb)
      - `contact_info` (jsonb)
      - `rating` (decimal)
      - `is_featured` (boolean)
      - `created_at` (timestamp)
    
    - `packages_2025_10_14_17_34` - Travel packages
      - `id` (uuid, primary key)
      - `name` (varchar)
      - `description` (text)
      - `duration_days` (integer)
      - `price` (decimal)
      - `destinations` (jsonb)
      - `inclusions` (jsonb)
      - `exclusions` (jsonb)
      - `images` (jsonb)
      - `is_featured` (boolean)
      - `is_custom` (boolean)
      - `created_at` (timestamp)
    
    - `profiles_2025_10_14_17_34` - User profiles
    - `bookings_2025_10_14_17_34` - Booking records
    - `contact_submissions_2025_10_14_17_34` - Contact form submissions

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated user access
*/

CREATE TABLE IF NOT EXISTS public.categories_2025_10_14_17_34 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.destinations_2025_10_14_17_34 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories_2025_10_14_17_34(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    price_range VARCHAR(50),
    images JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    contact_info JSONB DEFAULT '{}',
    rating DECIMAL(2,1) DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.packages_2025_10_14_17_34 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_days INTEGER,
    price DECIMAL(10,2),
    destinations JSONB DEFAULT '[]',
    inclusions JSONB DEFAULT '[]',
    exclusions JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT false,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles_2025_10_14_17_34 (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(200),
    phone VARCHAR(20),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings_2025_10_14_17_34 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.packages_2025_10_14_17_34(id),
    guest_name VARCHAR(200),
    guest_email VARCHAR(200),
    guest_phone VARCHAR(20),
    travel_date DATE,
    group_size INTEGER DEFAULT 1,
    budget_range VARCHAR(50),
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_submissions_2025_10_14_17_34 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    travel_dates VARCHAR(100),
    group_size INTEGER,
    budget_range VARCHAR(50),
    service_interests JSONB DEFAULT '[]',
    special_requirements TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.categories_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for categories" ON public.categories_2025_10_14_17_34;
DROP POLICY IF EXISTS "Public read access for destinations" ON public.destinations_2025_10_14_17_34;
DROP POLICY IF EXISTS "Public read access for packages" ON public.packages_2025_10_14_17_34;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles_2025_10_14_17_34;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles_2025_10_14_17_34;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles_2025_10_14_17_34;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings_2025_10_14_17_34;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings_2025_10_14_17_34;
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions_2025_10_14_17_34;

CREATE POLICY "Public read access for categories" ON public.categories_2025_10_14_17_34 FOR SELECT USING (true);
CREATE POLICY "Public read access for destinations" ON public.destinations_2025_10_14_17_34 FOR SELECT USING (true);
CREATE POLICY "Public read access for packages" ON public.packages_2025_10_14_17_34 FOR SELECT USING (true);

CREATE POLICY "Users can view own profile" ON public.profiles_2025_10_14_17_34 FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles_2025_10_14_17_34 FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles_2025_10_14_17_34 FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own bookings" ON public.bookings_2025_10_14_17_34 FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings_2025_10_14_17_34 FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions_2025_10_14_17_34 FOR INSERT WITH CHECK (true);
