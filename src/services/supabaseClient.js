import { createClient } from '@supabase/supabase-js';

// Trim environment variables to remove whitespace that causes %20 encoding
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

let supabase = null;

// Validate and create client gracefully — never throw to prevent app crash
if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase env vars missing — running without auth/database. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
} else {
  try {
    // Validate URL format
    new URL(supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.warn("⚠️ Supabase client creation failed:", error.message, "— running without auth/database.");
    supabase = null;
  }
}

export { supabase };


