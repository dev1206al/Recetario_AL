-- ============================================================
-- RECETARIO AL — Supabase Schema
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ── Tabla de recetas ─────────────────────────────────────────
create table public.recipes (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  title        text not null,
  description  text default '',
  category     text not null default 'otros',
  tags         text[] default '{}',
  difficulty   smallint check (difficulty between 1 and 3) default 1,
  servings     int default 4,
  prep_time    int default 0,  -- minutos
  cook_time    int default 0,  -- minutos
  rest_time    int default 0,  -- minutos (reposo, macerado, etc.)
  notes        text default '',
  is_public    boolean default false,
  cover_url    text default null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── Tabla de ingredientes ─────────────────────────────────────
create table public.ingredients (
  id          uuid primary key default uuid_generate_v4(),
  recipe_id   uuid references public.recipes(id) on delete cascade not null,
  name        text not null,
  amount      text default '',
  unit        text default '',
  order_index int default 0
);

-- ── Tabla de pasos ────────────────────────────────────────────
create table public.steps (
  id            uuid primary key default uuid_generate_v4(),
  recipe_id     uuid references public.recipes(id) on delete cascade not null,
  content       text not null,
  timer_minutes int default null,
  order_index   int default 0
);

-- ── Tabla de fotos ────────────────────────────────────────────
create table public.recipe_photos (
  id           uuid primary key default uuid_generate_v4(),
  recipe_id    uuid references public.recipes(id) on delete cascade not null,
  storage_path text not null,
  url          text not null,
  is_cover     boolean default false,
  order_index  int default 0,
  created_at   timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────
alter table public.recipes       enable row level security;
alter table public.ingredients   enable row level security;
alter table public.steps         enable row level security;
alter table public.recipe_photos enable row level security;

-- Recetas: el dueño puede ver/crear/editar/eliminar las suyas
create policy "Own recipes" on public.recipes
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Recetas públicas: cualquiera puede leer
create policy "Public recipes readable" on public.recipes
  for select using (is_public = true);

-- Ingredientes: acceso basado en propiedad de la receta
create policy "Own ingredients" on public.ingredients
  for all using (
    exists (select 1 from public.recipes where id = recipe_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes where id = recipe_id and user_id = auth.uid())
  );

create policy "Public ingredients readable" on public.ingredients
  for select using (
    exists (select 1 from public.recipes where id = recipe_id and is_public = true)
  );

-- Pasos
create policy "Own steps" on public.steps
  for all using (
    exists (select 1 from public.recipes where id = recipe_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes where id = recipe_id and user_id = auth.uid())
  );

create policy "Public steps readable" on public.steps
  for select using (
    exists (select 1 from public.recipes where id = recipe_id and is_public = true)
  );

-- Fotos
create policy "Own photos" on public.recipe_photos
  for all using (
    exists (select 1 from public.recipes where id = recipe_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes where id = recipe_id and user_id = auth.uid())
  );

create policy "Public photos readable" on public.recipe_photos
  for select using (
    exists (select 1 from public.recipes where id = recipe_id and is_public = true)
  );

-- ── Trigger updated_at ────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_recipes_updated
  before update on public.recipes
  for each row execute procedure public.handle_updated_at();

-- ── Storage bucket ────────────────────────────────────────────
-- Ejecutar esto en Storage → New bucket (name: recipe-photos, public: true)
-- O ejecutar aquí si tienes permisos de service_role:
-- insert into storage.buckets (id, name, public) values ('recipe-photos', 'recipe-photos', true);

-- Políticas de storage (ejecutar en SQL Editor con service_role o configurar en dashboard)
create policy "Public photos viewable" on storage.objects
  for select using (bucket_id = 'recipe-photos');

create policy "Auth users can upload" on storage.objects
  for insert with check (
    bucket_id = 'recipe-photos' and auth.role() = 'authenticated'
  );

create policy "Users delete own uploads" on storage.objects
  for delete using (
    bucket_id = 'recipe-photos' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );
