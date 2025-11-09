import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://qsrxsiaiblbopqkbbjtg.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzcnhzaWFpYmxib3Bxa2JianRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQ4NzQsImV4cCI6MjA3NzY5MDg3NH0.1D10Mvwxtw4RJ7Zpgoy_0s5FqUomQPc87uQ12fbFMXU';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
