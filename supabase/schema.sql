-- ============================================================
-- ApiStack Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- APIS
-- ============================================================
create table if not exists public.apis (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  long_description text,
  category text not null,
  tags text[] not null default '{}',
  base_url text not null,
  auth_type text not null default 'none' check (auth_type in ('none', 'api_key', 'bearer', 'oauth2')),
  auth_header text,
  is_public boolean not null default true,
  is_featured boolean not null default false,
  endpoint_count integer not null default 0,
  version text not null default '1.0.0',
  documentation_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists apis_slug_idx on public.apis(slug);
create index if not exists apis_owner_idx on public.apis(owner_id);
create index if not exists apis_category_idx on public.apis(category);
create index if not exists apis_is_public_idx on public.apis(is_public);
create index if not exists apis_is_featured_idx on public.apis(is_featured);

-- ============================================================
-- API ENDPOINTS
-- ============================================================
create table if not exists public.api_endpoints (
  id uuid primary key default uuid_generate_v4(),
  api_id uuid references public.apis(id) on delete cascade not null,
  method text not null check (method in ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  path text not null,
  summary text,
  description text,
  request_body jsonb,
  response_example jsonb,
  parameters jsonb,
  created_at timestamptz not null default now()
);

create index if not exists api_endpoints_api_id_idx on public.api_endpoints(api_id);

-- ============================================================
-- FAVORITES
-- ============================================================
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  api_id uuid references public.apis(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, api_id)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_api_id_idx on public.favorites(api_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.apis enable row level security;
alter table public.api_endpoints enable row level security;
alter table public.favorites enable row level security;

-- PROFILES policies
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent non-admins from self-promoting to admin
    and (
      role = (select role from public.profiles where id = auth.uid())
      or (select role from public.profiles where id = auth.uid()) = 'admin'
    )
  );

-- APIS policies
create policy "Public APIs are viewable by everyone" on public.apis
  for select using (is_public = true);

create policy "Users can view their own private APIs" on public.apis
  for select using (auth.uid() = owner_id);

create policy "Admins can view all APIs" on public.apis
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can insert APIs" on public.apis
  for insert with check (auth.uid() = owner_id and auth.uid() is not null);

create policy "Users can update their own APIs" on public.apis
  for update using (auth.uid() = owner_id);

create policy "Admins can update all APIs" on public.apis
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can delete their own APIs" on public.apis
  for delete using (auth.uid() = owner_id);

create policy "Admins can delete all APIs" on public.apis
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- API ENDPOINTS policies
create policy "Endpoints viewable with their API" on public.api_endpoints
  for select using (
    exists (
      select 1 from public.apis
      where id = api_id and (is_public = true or owner_id = auth.uid())
    )
  );

create policy "API owners can manage endpoints" on public.api_endpoints
  for all using (
    exists (
      select 1 from public.apis
      where id = api_id and owner_id = auth.uid()
    )
  );

create policy "Admins can manage all endpoints" on public.api_endpoints
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- FAVORITES policies
create policy "Users can view their own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can manage their own favorites" on public.favorites
  for all using (auth.uid() = user_id);

-- ============================================================
-- SEED DATA (Optional demo APIs)
-- ============================================================

-- Note: To seed data, you'll first need a user to be created
-- via Google OAuth so a profile exists. Then you can use their
-- profile ID as owner_id.

-- Example seed (replace 'YOUR_USER_ID' with actual UUID):
-- insert into public.apis (owner_id, name, slug, description, category, base_url, is_public, is_featured, tags, endpoint_count)
-- values
--   ('YOUR_USER_ID', 'JSONPlaceholder', 'jsonplaceholder', 'Free fake REST API for testing and prototyping', 'Developer Tools', 'https://jsonplaceholder.typicode.com', true, true, ARRAY['fake', 'testing', 'rest', 'free'], 6),
--   ('YOUR_USER_ID', 'Open Weather Map', 'open-weather-map', 'Current weather data for any location on Earth', 'Weather', 'https://api.openweathermap.org/data/2.5', true, true, ARRAY['weather', 'forecast', 'climate'], 3);
