-- Drop existing tables and extensions
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
alter table auth.users enable row level security;

-- Create organizations table
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  industry text,
  size text,
  website text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create organization_members table
create table public.organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(organization_id, user_id)
);

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  job_title text,
  phone text,
  notification_settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create materials table
create table public.materials (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade,
  code text not null,
  name text not null,
  category text not null,
  scope text not null check (scope in ('scope1', 'scope2', 'scope3')),
  unit text not null,
  emission_factor decimal not null,
  source text not null,
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references auth.users on delete set null,
  updated_by uuid references auth.users on delete set null,
  unique(organization_id, code)
);

-- Create projects table (supports both business units and projects)
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade,
  name text not null,
  description text,
  type text not null check (type in ('business_unit', 'project')),
  code text not null,
  status text not null check (status in ('active', 'inactive', 'draft')) default 'draft',
  location text,
  parent_id uuid references public.projects(id),
  emissions_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references auth.users on delete set null,
  updated_by uuid references auth.users on delete set null,
  unique(organization_id, code)
);

-- Create project_members table
create table public.project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(project_id, user_id)
);

-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;

-- RLS Policies
-- Organizations
create policy "Users can view their organizations" on organizations
  for select using (
    auth.uid() in (
      select user_id from organization_members where organization_id = organizations.id
    )
  );

create policy "Only owners can update organization" on organizations
  for update using (
    auth.uid() in (
      select user_id from organization_members 
      where organization_id = organizations.id and role = 'owner'
    )
  );

-- Organization Members
create policy "Users can view members in their organization" on organization_members
  for select using (
    auth.uid() in (
      select user_id from organization_members 
      where organization_id = organization_members.organization_id
    )
  );

create policy "Only owners/admins can manage members" on organization_members
  for all using (
    auth.uid() in (
      select user_id from organization_members 
      where organization_id = organization_members.organization_id 
      and role in ('owner', 'admin')
    )
  );

-- Profiles
create policy "Users can view profiles in their organization" on profiles
  for select using (
    auth.uid() in (
      select om.user_id from organization_members om
      where exists (
        select 1 from organization_members
        where user_id = profiles.id and organization_id = om.organization_id
      )
    )
  );

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- Materials
create policy "Users can view materials in their organization" on materials
  for select using (
    auth.uid() in (
      select user_id from organization_members 
      where organization_id = materials.organization_id
    )
  );

create policy "Members can manage materials" on materials
  for all using (
    auth.uid() in (
      select user_id from organization_members 
      where organization_id = materials.organization_id
    )
  );

-- Projects
create policy "Users can view projects in their organization" on projects
  for select using (
    auth.uid() in (
      select user_id from organization_members 
      where organization_id = projects.organization_id
    )
  );

create policy "Members can manage projects" on projects
  for all using (
    auth.uid() in (
      select user_id from organization_members 
      where organization_id = projects.organization_id
    )
  );

-- Project Members
create policy "Users can view project members" on project_members
  for select using (
    auth.uid() in (
      select user_id from organization_members 
      where organization_id = (
        select organization_id from projects where id = project_members.project_id
      )
    )
  );

create policy "Project owners/admins can manage members" on project_members
  for all using (
    auth.uid() in (
      select user_id from project_members
      where project_id = project_members.project_id 
      and role in ('owner', 'admin')
    )
  );