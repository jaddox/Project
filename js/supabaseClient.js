import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://zeuigdzpwltgqwkyhgse.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldWlnZHpwd2x0Z3F3a3loZ3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjQ3NjAsImV4cCI6MjA4NjMwMDc2MH0.P1SQjSJ-DoQnN0Fb9DwwyB5Q7u0usgeyJ69CXfenHqc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // remember-me ON di default
  }
});
