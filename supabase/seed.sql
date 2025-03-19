-- Clean existing data
TRUNCATE auth.users CASCADE;
TRUNCATE public.organizations, public.organization_members, public.profiles, public.materials, public.projects, public.project_members CASCADE;

-- Create admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  'be88de73-52bd-4043-bb2f-9ce9e13d3465',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test User"}'
);

-- Create identity for the user
INSERT INTO auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'be88de73-52bd-4043-bb2f-9ce9e13d3465',
  'test@example.com',
  'be88de73-52bd-4043-bb2f-9ce9e13d3465',
  '{"sub":"be88de73-52bd-4043-bb2f-9ce9e13d3465","email":"test@example.com"}'::jsonb,
  'email',
  now(),
  now(),
  now()
);

-- Create Organizations
INSERT INTO organizations (id, name, industry, size, website, address) VALUES 
  ('00000000-0000-0000-0000-000000000011', 'Demo Organization', 'Technology', '10-50', 'example.com', '123 Example St');

-- Create User Profiles
INSERT INTO profiles (id, full_name, job_title, phone) VALUES 
  ('be88de73-52bd-4043-bb2f-9ce9e13d3465', 'Test User', 'Administrator', '+1-555-123-4567');

-- Create Organization Members 
INSERT INTO organization_members (organization_id, user_id, role) VALUES 
  ('00000000-0000-0000-0000-000000000011', 'be88de73-52bd-4043-bb2f-9ce9e13d3465', 'owner');

-- Create a sample project
INSERT INTO projects (id, organization_id, name, description, type, code, status, created_by) VALUES 
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000011', 'Demo Project', 'A demo project', 'project', 'DEMO-001', 'active', 'be88de73-52bd-4043-bb2f-9ce9e13d3465');

-- Create Project Members
INSERT INTO project_members (project_id, user_id, role) VALUES 
  ('00000000-0000-0000-0000-000000000021', 'be88de73-52bd-4043-bb2f-9ce9e13d3465', 'owner');