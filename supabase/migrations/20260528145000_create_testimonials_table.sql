-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    name VARCHAR(200) NOT NULL,
    trek VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies
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
