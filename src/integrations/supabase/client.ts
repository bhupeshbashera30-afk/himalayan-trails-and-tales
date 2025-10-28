import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jhfjtlqtjyzcgzrdjhis.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZmp0bHF0anl6Y2d6cmRqaGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDk1NTUsImV4cCI6MjA3NTkyNTU1NX0.kgpjPw2AME-HG92JVchLTOt9BFmmp_VLHEu5Jp9tni4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
