-- Organizations and core tables
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  industry text,
  size text,
  website text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, user_id)
);

create table organization_invites (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  code text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table organization_invites enable row level security;

-- Organizations policies
create policy "Organizations are viewable by members"
  on organizations for select
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
    )
  );

create policy "Organizations can be created by authenticated users"
  on organizations for insert
  with check (auth.role() = 'authenticated');

create policy "Organizations can be updated by owners and admins"
  on organizations for update
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
  );

-- Organization members policies
create policy "Members are viewable by organization members"
  on organization_members for select
  using (
    exists (
      select 1 from organization_members as om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
    )
  );

create policy "Members can be managed by owners and admins"
  on organization_members for all
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organization_members.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
  );

-- Organization invites policies
create policy "Invites are viewable by organization admins and owners"
  on organization_invites for select
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organization_invites.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
  );

create policy "Invites can be created by organization admins and owners"
  on organization_invites for insert
  with check (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organization_invites.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
  );

create policy "Invites can be used by any authenticated user"
  on organization_invites for select
  using (auth.role() = 'authenticated');

create policy "Invites can be deleted by organization admins and owners"
  on organization_invites for delete
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organization_invites.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
  );
