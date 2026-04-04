import { createClient } from "@supabase/supabase-js";

/** Browser-only Supabase client (uses VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY). */
export function getSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
