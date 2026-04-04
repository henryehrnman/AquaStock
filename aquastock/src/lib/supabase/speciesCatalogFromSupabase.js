/** Map a Supabase `species` row to the shape the UI expects (camelCase). */
export function mapSpeciesRow(r) {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    water: r.water,
    minTank: r.min_tank,
    tempMin: r.temp_min,
    tempMax: r.temp_max,
    phMin: Number(r.ph_min),
    phMax: Number(r.ph_max),
    ghMin: r.gh_min,
    ghMax: r.gh_max,
    khMin: r.kh_min,
    khMax: r.kh_max,
    school: r.school,
    bioload: Number(r.bioload),
    difficulty: r.difficulty,
    img: r.img,
    photo: r.photo ?? "",
    color: r.color,
    desc: r.description ?? "",
    ...(r.popular ? { popular: true } : {}),
  };
}

export function mapCuratedSetupRow(r) {
  return {
    name: r.name,
    water: r.water,
    minTank: r.min_tank,
    desc: r.description ?? "",
    species: Array.isArray(r.species_ids) ? r.species_ids : [],
    gradient: r.gradient,
  };
}

/** Load species + curated setups from Supabase (public anon client). */
export async function fetchCatalog(supabase) {
  const [speciesRes, setupsRes] = await Promise.all([
    supabase.from("species").select("*").order("id"),
    supabase.from("curated_setups").select("*").order("sort_order"),
  ]);
  if (speciesRes.error) throw speciesRes.error;
  if (setupsRes.error) throw setupsRes.error;
  return {
    species: (speciesRes.data ?? []).map(mapSpeciesRow),
    curatedSetups: (setupsRes.data ?? []).map(mapCuratedSetupRow),
  };
}
