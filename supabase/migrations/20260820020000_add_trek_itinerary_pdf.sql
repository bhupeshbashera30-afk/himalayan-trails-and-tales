-- Add itinerary_pdf column to public.treks
ALTER TABLE public.treks ADD COLUMN IF NOT EXISTS itinerary_pdf TEXT;

-- Create trek-itineraries bucket for PDF files if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('trek-itineraries', 'trek-itineraries', true)
ON CONFLICT (id) DO NOTHING;

-- Public access policy for reading PDF itineraries
DROP POLICY IF EXISTS "Public access to trek itineraries" ON storage.objects;
CREATE POLICY "Public access to trek itineraries"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trek-itineraries' OR bucket_id = 'trek-images');

-- Admin policy for uploading PDF itineraries
DROP POLICY IF EXISTS "Anyone can upload trek itineraries" ON storage.objects;
CREATE POLICY "Anyone can upload trek itineraries"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'trek-itineraries' OR bucket_id = 'trek-images');
