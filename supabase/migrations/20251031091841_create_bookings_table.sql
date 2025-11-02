/*
  # Create Bookings Table

  1. New Tables
    - `bookings_2025_10_14_17_34`
      - `id` (uuid, primary key)
      - `destination_id` (uuid, foreign key to destinations)
      - `category_id` (uuid, foreign key to categories)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `travel_dates` (text)
      - `group_size` (integer)
      - `special_requirements` (text)
      - `created_at` (timestamp)
*/

CREATE TABLE IF NOT EXISTS public.bookings_2025_10_14_17_34 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid,
  category_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  travel_dates text NOT NULL,
  group_size integer DEFAULT 1,
  special_requirements text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_destination FOREIGN KEY (destination_id) REFERENCES public.destinations_2025_10_14_17_34(id),
  CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories_2025_10_14_17_34(id)
);

ALTER TABLE public.bookings_2025_10_14_17_34 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings"
  ON public.bookings_2025_10_14_17_34
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
  ON public.bookings_2025_10_14_17_34
  FOR SELECT
  TO anon, authenticated
  USING (true);
