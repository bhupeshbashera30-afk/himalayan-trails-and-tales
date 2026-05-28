-- 1. Add booking/trek-like columns to packages table
ALTER TABLE public.packages_2025_10_14_17_34 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS location VARCHAR(200),
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS max_seats INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS seats_booked INTEGER DEFAULT 0;

-- Update existing packages with some dummy/default data so they show up beautifully
UPDATE public.packages_2025_10_14_17_34
SET 
  location = COALESCE(location, 'Uttarakhand, India'),
  start_date = COALESCE(start_date, CURRENT_DATE + INTERVAL '1 month'),
  end_date = COALESCE(end_date, CURRENT_DATE + INTERVAL '1 month' + INTERVAL '5 days'),
  difficulty = COALESCE(difficulty, 'moderate'),
  max_seats = COALESCE(max_seats, 15),
  seats_booked = COALESCE(seats_booked, 0)
WHERE location IS NULL;

-- 2. Modify trek_registrations table to support package interest bookings
ALTER TABLE public.trek_registrations 
ALTER COLUMN trek_id DROP NOT NULL;

-- Add package_id column to trek_registrations with foreign key referencing packages table
ALTER TABLE public.trek_registrations 
ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.packages_2025_10_14_17_34(id) ON DELETE CASCADE;

-- 3. Update trigger function to automatically handle both treks and packages seats_booked counts
CREATE OR REPLACE FUNCTION public.update_trek_seats_booked()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the trek for the new registration if applicable
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.trek_id IS NOT NULL THEN
    UPDATE public.treks
    SET seats_booked = COALESCE(
      (SELECT SUM(num_people) 
       FROM public.trek_registrations 
       WHERE trek_id = NEW.trek_id AND status = 'confirmed'), 
      0
    )
    WHERE id = NEW.trek_id;
  END IF;

  -- Update the trek for the old registration if it was updated or deleted
  IF (TG_OP = 'DELETE' AND OLD.trek_id IS NOT NULL) OR 
     (TG_OP = 'UPDATE' AND OLD.trek_id IS NOT NULL AND OLD.trek_id IS DISTINCT FROM NEW.trek_id) THEN
    UPDATE public.treks
    SET seats_booked = COALESCE(
      (SELECT SUM(num_people) 
       FROM public.trek_registrations 
       WHERE trek_id = OLD.trek_id AND status = 'confirmed'), 
      0
    )
    WHERE id = OLD.trek_id;
  END IF;

  -- Update the package for the new registration if applicable
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.package_id IS NOT NULL THEN
    UPDATE public.packages_2025_10_14_17_34
    SET seats_booked = COALESCE(
      (SELECT SUM(num_people) 
       FROM public.trek_registrations 
       WHERE package_id = NEW.package_id AND status = 'confirmed'), 
      0
    )
    WHERE id = NEW.package_id;
  END IF;

  -- Update the package for the old registration if it was updated or deleted
  IF (TG_OP = 'DELETE' AND OLD.package_id IS NOT NULL) OR 
     (TG_OP = 'UPDATE' AND OLD.package_id IS NOT NULL AND OLD.package_id IS DISTINCT FROM NEW.package_id) THEN
    UPDATE public.packages_2025_10_14_17_34
    SET seats_booked = COALESCE(
      (SELECT SUM(num_people) 
       FROM public.trek_registrations 
       WHERE package_id = OLD.package_id AND status = 'confirmed'), 
      0
    )
    WHERE id = OLD.package_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Enable Realtime for packages table
alter publication supabase_realtime add table public.packages_2025_10_14_17_34;
