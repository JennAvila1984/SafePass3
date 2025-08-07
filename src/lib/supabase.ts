import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://tphiwvfikcenfoxvlhal.supabase.co';
const supabaseKey = 'sb_publishable_iNcH6mTkZpIhcqs6dlA1Bw_t4pzuC5t';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };