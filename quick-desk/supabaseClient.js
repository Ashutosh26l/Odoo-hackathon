import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bndeyipllyombfqqigpx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZGV5aXBsbHlvbWJmcXFpZ3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTIzNjMsImV4cCI6MjA2OTY4ODM2M30.4BikvKVO5vqeEpBR5QkyoLEf0GmjQuwrypaK_j3ZsJQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
