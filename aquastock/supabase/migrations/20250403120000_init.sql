-- AquaStock catalog: run in Supabase SQL Editor or via `supabase db push`

create table if not exists public.species (
  id integer primary key,
  name text not null,
  type text not null,
  water text not null,
  min_tank integer not null,
  temp_min integer not null,
  temp_max integer not null,
  ph_min numeric(4,1) not null,
  ph_max numeric(4,1) not null,
  gh_min integer not null,
  gh_max integer not null,
  kh_min integer not null,
  kh_max integer not null,
  school integer not null,
  bioload numeric(6,2) not null default 1,
  difficulty text not null,
  img text not null default '🐟',
  photo text not null default '',
  color text not null default '#00e5ff',
  description text not null default '',
  popular boolean not null default false
);

create index if not exists species_water_idx on public.species (water);
create index if not exists species_type_idx on public.species (type);

create table if not exists public.curated_setups (
  id bigint generated always as identity primary key,
  name text not null unique,
  water text not null,
  min_tank integer not null,
  description text not null default '',
  species_ids integer[] not null default '{}',
  gradient text not null,
  sort_order integer not null default 0
);

alter table public.species enable row level security;
alter table public.curated_setups enable row level security;

create policy "species_select_public"
  on public.species for select
  using (true);

create policy "curated_setups_select_public"
  on public.curated_setups for select
  using (true);
