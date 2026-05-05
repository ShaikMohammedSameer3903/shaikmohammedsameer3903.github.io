import { createClient } from '@supabase/supabase-js';

// Trim environment variables to remove whitespace that causes %20 encoding
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Debug: Log environment variables
console.log('[Supabase] Environment check:', {
  url: supabaseUrl ? 'SET' : 'MISSING',
  key: supabaseKey ? 'SET' : 'MISSING',
  urlPreview: supabaseUrl?.substring(0, 20) + '...'
});

let supabase = null;

// Validate and create client gracefully — never throw to prevent app crash
if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase env vars missing — running without auth/database. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  console.warn('[Supabase] Missing vars:', { 
    VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY 
  });
} else {
  try {
    // Validate URL format
    new URL(supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Client created successfully');
  } catch (error) {
    console.warn("⚠️ Supabase client creation failed:", error.message, "— running without auth/database.");
    supabase = null;
  }
}

export { supabase };


