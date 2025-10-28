-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Categories table for main menu items
CREATE TABLE public.categories_2025_10_14_17_34 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations/Services table
CREATE TABLE public.destinations_2025_10_14_17_34 (
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

-- Packages table (pre-made and custom)
CREATE TABLE public.packages_2025_10_14_17_34 (
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

-- User profiles table
CREATE TABLE public.profiles_2025_10_14_17_34 (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(200),
    phone VARCHAR(20),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings_2025_10_14_17_34 (
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

-- Contact submissions table
CREATE TABLE public.contact_submissions_2025_10_14_17_34 (
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

-- Insert initial categories
INSERT INTO public.categories_2025_10_14_17_34 (name, slug, description, icon) VALUES
('Pahadi Platter', 'pahadi-platter', 'Authentic Pahadi restaurants and local cuisine experiences', 'utensils'),
('Rest & Nest', 'rest-nest', 'Comfortable stays and Airbnb accommodations', 'bed'),
('Adventure Alley', 'adventure-alley', 'Thrilling activities like paragliding, skiing, and boating', 'mountain'),
('Soul Spots', 'soul-spots', 'Peaceful locations for tranquil and spiritual experiences', 'heart');

-- RLS Policies
ALTER TABLE public.categories_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, destinations, and packages
CREATE POLICY "Public read access for categories" ON public.categories_2025_10_14_17_34 FOR SELECT USING (true);
CREATE POLICY "Public read access for destinations" ON public.destinations_2025_10_14_17_34 FOR SELECT USING (true);
CREATE POLICY "Public read access for packages" ON public.packages_2025_10_14_17_34 FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can view own profile" ON public.profiles_2025_10_14_17_34 FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles_2025_10_14_17_34 FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles_2025_10_14_17_34 FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own bookings" ON public.bookings_2025_10_14_17_34 FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings_2025_10_14_17_34 FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions_2025_10_14_17_34 FOR INSERT WITH CHECK (true);