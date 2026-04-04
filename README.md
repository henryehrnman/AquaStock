# AquaStock by Henry Ehrnman

## Supabase catalog (required)

The app loads **only** from your Supabase tables `species` and `curated_setups`. There is **no bundled species list** in this repository.

1. Create a project at [supabase.com](https://supabase.com/).
2. In **SQL Editor**, run `aquastock/supabase/migrations/20250403120000_init.sql` to create the tables.
3. **Add data** using any of:
   - **Table Editor** — insert/edit rows on `species` and `curated_setups`
   - **SQL** — your own `INSERT` statements
   - **CSV import** — from the Supabase dashboard  
   Column names in the database are snake_case (`min_tank`, `description`, `species_ids` on setups, etc.); see the migration file for types and defaults.
4. Copy **Project URL** and **anon public** key into `aquastock/.env` (see `.env.example`).
5. Run the app with `npm run dev`. If tables are empty or env is wrong, the UI explains what to fix.

6. **Vercel**
   - This repo keeps the Vite app in **`aquastock/`**. Either:
     - **Option A (recommended):** leave **Root Directory** empty (repo root). The root **`vercel.json`** installs and builds inside `aquastock/` and publishes **`aquastock/dist`**.
     - **Option B:** set **Root Directory** to `aquastock` (then Framework Preset **Vite**, Output **dist**). You can remove or ignore the root `vercel.json` in that case.
   - **Environment Variables** (same names as local `.env`):
     - `VITE_SUPABASE_URL` = Supabase **Project URL**
     - `VITE_SUPABASE_ANON_KEY` = **anon public** key (not the service role)
   - Enable them for **Production** and **Preview** if you use preview URLs.
   - **Redeploy** after changing env vars (Deployments → … → Redeploy).

### If the deployed site still fails

| Symptom | What to fix |
|--------|-------------|
| “Supabase not configured” | Env vars missing or only set for Production while you’re on a **Preview** URL — add for Preview too, redeploy. |
| Blank / wrong build | Root Directory: use **Option A or B** above consistently; check **Vercel → Deployments → Build Logs** for errors. |
| “Could not load catalog” / console errors | Run **`aquastock/supabase/migrations/20250403120000_init.sql`** in Supabase SQL Editor (tables + RLS). Confirm **Table Editor → species** exists. |
| “No species in the database” | Normal until you **insert rows** into `species` (and optionally `curated_setups`). |

### Example: one species row (SQL)

Adjust values as needed; run in Supabase SQL Editor after the migration:

```sql
insert into public.species (
  id, name, type, water, min_tank, temp_min, temp_max,
  ph_min, ph_max, gh_min, gh_max, kh_min, kh_max,
  school, bioload, difficulty, img, photo, color, description, popular
) values (
  1, 'Neon Tetra', 'fish', 'freshwater', 10, 70, 82,
  5.0, 7.5, 1, 10, 1, 5,
  6, 1, 'beginner', '🐟', '', '#00e5ff', 'Example row — replace or add more.', true
);
```

### Repo layout (`aquastock/`)

| Path | Purpose |
|------|--------|
| `src/app/App.jsx` | Main screen flow (landing → setup → matches → stock planner) |
| `src/app/components/ambient/` | Decorative fish, bubbles, pixel logo (not real catalog data) |
| `src/app/components/catalog/` | “Can’t load catalog” messages |
| `src/app/components/species/` | Species avatar / Wikipedia image loading |
| `src/config/` | UI-only helpers (type labels; optional Wikipedia photo overrides — empty by default) |
| `src/lib/supabase/browserClient.js` | Browser Supabase client (`VITE_*` env) |
| `src/lib/supabase/speciesCatalogFromSupabase.js` | Reads species + setups from the database |
| `src/styles/global.css` | Global styles |
| `supabase/migrations/` | SQL schema for new projects (`supabase/README.txt` explains vs `src/lib/supabase`) |
