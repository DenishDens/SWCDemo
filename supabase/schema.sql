
-- Enable RLS
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
alter table public.organizations enable row level security;

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
alter table public.organization_members enable row level security;

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
alter table public.profiles enable row level security;

-- Create emission_factors table
create table public.emission_factors (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade,
  name text not null,
  category text not null,
  scope integer not null check (scope in (1, 2, 3)),
  unit text not null,
  emission_factor decimal not null,
  source text not null,
  documentation jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references auth.users on delete set null,
  updated_by uuid references auth.users on delete set null
);
alter table public.emission_factors enable row level security;

-- Create projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade,
  name text not null,
  description text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references auth.users on delete set null
);
alter table public.projects enable row level security;

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

-- Emission Factors
create policy "Users can view emission factors in their organization" on emission_factors
  for select using (
    auth.uid() in (
      select user_id from organization_members 
      where organization_id = emission_factors.organization_id
    )
  );

create policy "Members can manage emission factors" on emission_factors
  for all using (
    auth.uid() in (
      select user_id from organization_members 
      where organization_id = emission_factors.organization_id
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

-- Insert sample data
insert into organizations (id, name, industry, size, website) values 
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'Green Corp', 'Manufacturing', '1000+', 'greencorp.com'),
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'Eco Solutions', 'Technology', '100-500', 'ecosolutions.com');

insert into auth.users (id, email, encrypted_password, email_confirmed_at) values 
  ('8d1e3562-e274-4a7b-b81c-e827b42b4256', 'admin@greencorp.com', crypt('Admin123!', gen_salt('bf')), now()),
  ('c92f4b31-97b3-4da7-b81c-e827b42b4259', 'user@greencorp.com', crypt('User123!', gen_salt('bf')), now()),
  ('e721f1d8-89a3-4da1-a242-e2f25c0b70a1', 'admin@ecosolutions.com', crypt('Eco123!', gen_salt('bf')), now());

insert into organization_members (organization_id, user_id, role) values 
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', '8d1e3562-e274-4a7b-b81c-e827b42b4256', 'owner'),
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'c92f4b31-97b3-4da7-a3b7-1cd3ea3859ad', 'member'),
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'e721f1d8-89a3-4da1-a242-e2f25c0b70a1', 'owner');

insert into profiles (id, full_name, job_title) values 
  ('8d1e3562-e274-4a7b-b81c-e827b42b4256', 'John Admin', 'Sustainability Director'),
  ('c92f4b31-97b3-4da7-a3b7-1cd3ea3859ad', 'Jane User', 'Environmental Analyst'),
  ('e721f1d8-89a3-4da1-a242-e2f25c0b70a1', 'Mike Owner', 'CEO');

insert into emission_factors (organization_id, name, category, scope, unit, emission_factor, source) values 
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'Natural Gas', 'Stationary Combustion', 1, 'm³', 2.1, 'GHG Protocol'),
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'Electricity', 'Purchased Energy', 2, 'kWh', 0.5, 'EPA'),
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'Business Travel', 'Travel', 3, 'km', 0.14, 'DEFRA');

insert into projects (organization_id, name, description, created_by) values 
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'Factory Optimization', 'Reducing emissions in manufacturing', '8d1e3562-e274-4a7b-b81c-e827b42b4256'),
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'Green Energy Transition', 'Switching to renewable energy', '8d1e3562-e274-4a7b-b81c-e827b42b4256'),
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'Supply Chain Analysis', 'Scope 3 emissions tracking', 'e721f1d8-89a3-4da1-a242-e2f25c0b70a1');
