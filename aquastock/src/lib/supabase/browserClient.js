import { createClient } from "@supabase/supabase-js";

function readSupabaseEnv() {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
  const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();
  return { url, key };
}

function isPlaceholderSupabaseUrl(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  if (lower.includes("your-project-ref") || lower.includes("your_project_ref")) return true;
  if (lower.includes("xxxxxxxx")) return true;
  return false;
}

let warnedMissingEnv = false;

/** Browser-only Supabase client (uses VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY). */
export function getSupabase() {
  const { url, key } = readSupabaseEnv();
  if (!url || !key || isPlaceholderSupabaseUrl(url)) {
    if (import.meta.env.DEV && !warnedMissingEnv) {
      warnedMissingEnv = true;
      // eslint-disable-next-line no-console
      console.warn(
        "[AquaStock] Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to aquastock/.env (see .env.example), then restart npm run dev.",
      );
    }
    return null;
  }
  return createClient(url, key);
}
