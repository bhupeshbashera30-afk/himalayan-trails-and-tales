-- Enable Realtime for treks table so changes are pushed to client apps instantly
alter publication supabase_realtime add table public.treks;
