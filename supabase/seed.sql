
-- Clean existing data
TRUNCATE TABLE organizations, organization_members, profiles, materials, projects, project_members CASCADE;

-- Create Organizations
INSERT INTO organizations (id, name, industry, size, website, address) VALUES 
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'EcoTech Solutions', 'Technology', '500-1000', 'ecotechsolutions.com', '123 Green Street, San Francisco, CA'),
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'Sustainable Manufacturing Co', 'Manufacturing', '1000+', 'sustainablemfg.com', '456 Clean Ave, Detroit, MI');

-- Create Users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at) VALUES 
  ('8d1e3562-e274-4a7b-b81c-e827b42b4256', 'admin@ecotechsolutions.com', crypt('Admin123!', gen_salt('bf')), now()),
  ('c92f4b31-97b3-4da7-b81c-e827b42b4259', 'manager@ecotechsolutions.com', crypt('Manager123!', gen_salt('bf')), now()),
  ('e721f1d8-89a3-4da1-a242-e2f25c0b70a1', 'admin@sustainablemfg.com', crypt('SMAdmin123!', gen_salt('bf')), now());

-- Create Organization Members
INSERT INTO organization_members (organization_id, user_id, role) VALUES 
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', '8d1e3562-e274-4a7b-b81c-e827b42b4256', 'owner'),
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'c92f4b31-97b3-4da7-b81c-e827b42b4259', 'admin'),
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'e721f1d8-89a3-4da1-a242-e2f25c0b70a1', 'owner');

-- Create Profiles
INSERT INTO profiles (id, full_name, job_title, phone) VALUES 
  ('8d1e3562-e274-4a7b-b81c-e827b42b4256', 'Sarah Johnson', 'Sustainability Director', '+1-555-0123'),
  ('c92f4b31-97b3-4da7-b81c-e827b42b4259', 'Michael Chen', 'Environmental Manager', '+1-555-0124'),
  ('e721f1d8-89a3-4da1-a242-e2f25c0b70a1', 'David Smith', 'CEO', '+1-555-0125');

-- Create Materials Library
INSERT INTO materials (name, category, scope, unit, emission_factor, source, organization_id) VALUES 
  -- EcoTech Solutions Materials
  ('Natural Gas', 'Stationary Combustion', 'scope1', 'm³', 2.02, 'GHG Protocol', 'd4c74453-0ca4-4c79-a245-1a3b7e11eca1'),
  ('Diesel', 'Mobile Combustion', 'scope1', 'L', 2.68, 'GHG Protocol', 'd4c74453-0ca4-4c79-a245-1a3b7e11eca1'),
  ('Electricity', 'Purchased Energy', 'scope2', 'kWh', 0.42, 'EPA eGRID', 'd4c74453-0ca4-4c79-a245-1a3b7e11eca1'),
  ('Business Travel', 'Travel', 'scope3', 'km', 0.14, 'DEFRA', 'd4c74453-0ca4-4c79-a245-1a3b7e11eca1'),
  
  -- Sustainable Manufacturing Materials
  ('Natural Gas', 'Stationary Combustion', 'scope1', 'm³', 2.02, 'GHG Protocol', 'f892b455-d409-4c81-9328-952a2e6882e2'),
  ('Industrial Diesel', 'Manufacturing', 'scope1', 'L', 2.70, 'GHG Protocol', 'f892b455-d409-4c81-9328-952a2e6882e2'),
  ('Grid Electricity', 'Purchased Energy', 'scope2', 'kWh', 0.45, 'EPA eGRID', 'f892b455-d409-4c81-9328-952a2e6882e2'),
  ('Waste Disposal', 'Waste', 'scope3', 'tonnes', 0.58, 'EPA', 'f892b455-d409-4c81-9328-952a2e6882e2');

-- Create Business Units
INSERT INTO projects (organization_id, name, description, type, code, status, location, created_by) VALUES 
  -- EcoTech Solutions Business Units
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'Headquarters', 'Main corporate office', 'business_unit', 'HQ-001', 'active', 'San Francisco', '8d1e3562-e274-4a7b-b81c-e827b42b4256'),
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'R&D Center', 'Research facility', 'business_unit', 'RD-001', 'active', 'San Jose', '8d1e3562-e274-4a7b-b81c-e827b42b4256'),
  
  -- Sustainable Manufacturing Business Units
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'Plant Alpha', 'Main production facility', 'business_unit', 'PA-001', 'active', 'Detroit', 'e721f1d8-89a3-4da1-a242-e2f25c0b70a1'),
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'Plant Beta', 'Secondary production facility', 'business_unit', 'PB-001', 'active', 'Chicago', 'e721f1d8-89a3-4da1-a242-e2f25c0b70a1');

-- Create Projects
INSERT INTO projects (organization_id, name, description, type, code, status, parent_id, created_by) VALUES 
  -- EcoTech Solutions Projects
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'Solar Installation', 'Rooftop solar panel installation', 'project', 'PRJ-001', 'active', (SELECT id FROM projects WHERE code = 'HQ-001'), '8d1e3562-e274-4a7b-b81c-e827b42b4256'),
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'EV Fleet Transition', 'Converting vehicle fleet to electric', 'project', 'PRJ-002', 'draft', (SELECT id FROM projects WHERE code = 'RD-001'), 'c92f4b31-97b3-4da7-b81c-e827b42b4259'),
  
  -- Sustainable Manufacturing Projects
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'Energy Efficiency', 'Plant-wide energy optimization', 'project', 'PRJ-003', 'active', (SELECT id FROM projects WHERE code = 'PA-001'), 'e721f1d8-89a3-4da1-a242-e2f25c0b70a1'),
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'Waste Reduction', 'Zero waste initiative', 'project', 'PRJ-004', 'active', (SELECT id FROM projects WHERE code = 'PB-001'), 'e721f1d8-89a3-4da1-a242-e2f25c0b70a1');

-- Create Project Members
INSERT INTO project_members (project_id, user_id, role) 
SELECT p.id, u.id, 'owner'
FROM projects p
CROSS JOIN auth.users u
WHERE p.created_by = u.id;
