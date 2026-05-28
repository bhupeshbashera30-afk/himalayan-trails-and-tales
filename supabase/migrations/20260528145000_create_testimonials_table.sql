-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    name VARCHAR(200) NOT NULL,
    trek VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for testimonials
DROP POLICY IF EXISTS "Public read access for testimonials" ON public.testimonials;
CREATE POLICY "Public read access for testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Insert initial sample testimonials
INSERT INTO public.testimonials (text, rating, name, trek) VALUES
('Himalayan Trails & Tales turned my Valley of Flowers trek into something straight out of a dream. Every detail was perfect, from the local stays to the experienced guides.', 5, 'Priya Sharma', 'VALLEY OF FLOWERS'),
('The Chopta Chandrashila trek was breathtaking. The sunset, the snow peaks, the camp setup under the stars, it felt like a dream. Truly unforgettable experience.', 5, 'Rohan & Ananya', 'CHOPTA CHANDRASHILA'),
('Professional, creative, and so easy to travel with. Our group trip to Kedarkantha was absolutely stunning. The local organic food was a massive hit with everyone!', 5, 'Meera Kapoor', 'KEDARKANTHA TREK'),
('I wanted the Har Ki Dun trek to be perfect and Himalayan Trails & Tales delivered beyond my expectations. The view of the peaks was the most beautiful setting imaginable.', 5, 'Vikram Patel', 'HAR KI DUN TREK');


-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    site_name VARCHAR(200) DEFAULT 'Himalayan Trails & Tales',
    tagline VARCHAR(200) DEFAULT 'Discover Pahadi Spirit',
    phone VARCHAR(20) DEFAULT '+91 8630113945',
    email VARCHAR(200) DEFAULT 'himalayantrailtales@gmail.com',
    address VARCHAR(200) DEFAULT 'Haldwani, Uttarakhand',
    instagram VARCHAR(200) DEFAULT '',
    facebook VARCHAR(200) DEFAULT '',
    youtube VARCHAR(200) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings
DROP POLICY IF EXISTS "Public read access for site_settings" ON public.site_settings;
CREATE POLICY "Public read access for site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site_settings" ON public.site_settings;
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Insert initial sample site settings
INSERT INTO public.site_settings (id, site_name, tagline, phone, email, address, instagram, facebook, youtube)
VALUES ('default', 'Himalayan Trails & Tales', 'Discover Pahadi Spirit', '+91 8630113945', 'himalayantrailtales@gmail.com', 'Haldwani, Uttarakhand', '', '', '')
ON CONFLICT (id) DO NOTHING;
