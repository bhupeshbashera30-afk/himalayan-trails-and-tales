-- Create function to update seats_booked count automatically
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

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create it
DROP TRIGGER IF EXISTS trg_update_trek_seats_booked ON public.trek_registrations;
CREATE TRIGGER trg_update_trek_seats_booked
AFTER INSERT OR UPDATE OR DELETE ON public.trek_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_trek_seats_booked();

-- Sync existing seats_booked counts with current confirmed registrations
UPDATE public.treks t
SET seats_booked = COALESCE(
  (SELECT SUM(num_people) 
   FROM public.trek_registrations 
   WHERE trek_id = t.id AND status = 'confirmed'), 
  0
);
