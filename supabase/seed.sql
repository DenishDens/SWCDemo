
-- Clean existing data
TRUNCATE TABLE organizations, organization_members, profiles, materials, projects, project_members CASCADE;

-- Create Organizations
INSERT INTO organizations (id, name, industry, size, website, address) VALUES 
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'GreenTech Solutions', 'Technology', '500-1000', 'greentechsolutions.com', '123 Innovation Way, San Francisco, CA 94105'),
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'EcoManufacturing Inc', 'Manufacturing', '1000+', 'ecomanufacturing.com', '456 Industrial Blvd, Detroit, MI 48226'),
  ('c123d456-e789-4f01-b234-567c89d01e2f', 'Sustainable Retail Group', 'Retail', '100-500', 'sustainableretail.com', '789 Market St, Chicago, IL 60601');

-- Create Users with Encrypted Passwords
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at) VALUES 
  ('8d1e3562-e274-4a7b-b81c-e827b42b4256', 'admin@greentech.com', crypt('GreenTech2024!', gen_salt('bf')), now()),
  ('c92f4b31-97b3-4da7-b81c-e827b42b4259', 'manager@greentech.com', crypt('Manager2024!', gen_salt('bf')), now()),
  ('e721f1d8-89a3-4da1-a242-e2f25c0b70a1', 'analyst@greentech.com', crypt('Analyst2024!', gen_salt('bf')), now()),
  ('f832c945-b123-4567-89ab-cdef01234567', 'admin@ecomanufacturing.com', crypt('EcoMfg2024!', gen_salt('bf')), now()),
  ('a987f654-3210-4321-b098-76543c210987', 'admin@sustainableretail.com', crypt('SusRetail2024!', gen_salt('bf')), now());

-- Create Organization Members with Different Roles
INSERT INTO organization_members (organization_id, user_id, role) VALUES 
  -- GreenTech Solutions Team
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', '8d1e3562-e274-4a7b-b81c-e827b42b4256', 'owner'),
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'c92f4b31-97b3-4da7-b81c-e827b42b4259', 'admin'),
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'e721f1d8-89a3-4da1-a242-e2f25c0b70a1', 'member'),
  -- EcoManufacturing Team
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'f832c945-b123-4567-89ab-cdef01234567', 'owner'),
  -- Sustainable Retail Team
  ('c123d456-e789-4f01-b234-567c89d01e2f', 'a987f654-3210-4321-b098-76543c210987', 'owner');

-- Create User Profiles
INSERT INTO profiles (id, full_name, job_title, phone) VALUES 
  ('8d1e3562-e274-4a7b-b81c-e827b42b4256', 'Sarah Anderson', 'Sustainability Director', '+1-415-555-0101'),
  ('c92f4b31-97b3-4da7-b81c-e827b42b4259', 'Michael Chen', 'Environmental Manager', '+1-415-555-0102'),
  ('e721f1d8-89a3-4da1-a242-e2f25c0b70a1', 'Alex Rodriguez', 'Sustainability Analyst', '+1-415-555-0103'),
  ('f832c945-b123-4567-89ab-cdef01234567', 'David Kim', 'Operations Director', '+1-313-555-0104'),
  ('a987f654-3210-4321-b098-76543c210987', 'Emma Thompson', 'Retail Sustainability Lead', '+1-312-555-0105');

-- Create Materials Library
INSERT INTO materials (name, category, scope, unit, emission_factor, source, organization_id, created_by) VALUES 
  -- GreenTech Solutions Materials
  ('Natural Gas', 'Stationary Combustion', 'scope1', 'm³', 2.02, 'GHG Protocol', 'd4c74453-0ca4-4c79-a245-1a3b7e11eca1', '8d1e3562-e274-4a7b-b81c-e827b42b4256'),
  ('Diesel Fleet', 'Mobile Combustion', 'scope1', 'L', 2.68, 'GHG Protocol', 'd4c74453-0ca4-4c79-a245-1a3b7e11eca1', '8d1e3562-e274-4a7b-b81c-e827b42b4256'),
  ('Grid Electricity', 'Purchased Energy', 'scope2', 'kWh', 0.42, 'EPA eGRID', 'd4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'c92f4b31-97b3-4da7-b81c-e827b42b4259'),
  ('Business Flights', 'Business Travel', 'scope3', 'km', 0.14, 'DEFRA', 'd4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'c92f4b31-97b3-4da7-b81c-e827b42b4259'),
  
  -- EcoManufacturing Materials
  ('Process Heat', 'Manufacturing', 'scope1', 'MMBtu', 53.11, 'EPA', 'f892b455-d409-4c81-9328-952a2e6882e2', 'f832c945-b123-4567-89ab-cdef01234567'),
  ('Refrigerants', 'Fugitive Emissions', 'scope1', 'kg', 1430.0, 'EPA', 'f892b455-d409-4c81-9328-952a2e6882e2', 'f832c945-b123-4567-89ab-cdef01234567'),
  ('Purchased Steam', 'Purchased Energy', 'scope2', 'MMBtu', 66.33, 'EPA', 'f892b455-d409-4c81-9328-952a2e6882e2', 'f832c945-b123-4567-89ab-cdef01234567'),
  
  -- Sustainable Retail Materials
  ('Refrigeration', 'Stationary Combustion', 'scope1', 'kg', 1810.0, 'EPA', 'c123d456-e789-4f01-b234-567c89d01e2f', 'a987f654-3210-4321-b098-76543c210987'),
  ('Store Electricity', 'Purchased Energy', 'scope2', 'kWh', 0.45, 'EPA eGRID', 'c123d456-e789-4f01-b234-567c89d01e2f', 'a987f654-3210-4321-b098-76543c210987'),
  ('Waste to Landfill', 'Waste', 'scope3', 'tonnes', 0.58, 'EPA', 'c123d456-e789-4f01-b234-567c89d01e2f', 'a987f654-3210-4321-b098-76543c210987');

-- Create Business Units
INSERT INTO projects (id, organization_id, name, description, type, code, status, location, created_by) VALUES 
  -- GreenTech Solutions Business Units
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'd4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'Headquarters', 'Corporate HQ', 'business_unit', 'HQ-001', 'active', 'San Francisco', '8d1e3562-e274-4a7b-b81c-e827b42b4256'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'd4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'R&D Center', 'Research Facility', 'business_unit', 'RD-001', 'active', 'San Jose', '8d1e3562-e274-4a7b-b81c-e827b42b4256'),
  
  -- EcoManufacturing Business Units
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'f892b455-d409-4c81-9328-952a2e6882e2', 'Main Plant', 'Primary Manufacturing', 'business_unit', 'MP-001', 'active', 'Detroit', 'f832c945-b123-4567-89ab-cdef01234567'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8g', 'f892b455-d409-4c81-9328-952a2e6882e2', 'Distribution Center', 'Logistics Hub', 'business_unit', 'DC-001', 'active', 'Chicago', 'f832c945-b123-4567-89ab-cdef01234567'),
  
  -- Sustainable Retail Business Units
  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8g9h', 'c123d456-e789-4f01-b234-567c89d01e2f', 'Flagship Store', 'Main Retail Location', 'business_unit', 'FS-001', 'active', 'Chicago', 'a987f654-3210-4321-b098-76543c210987'),
  ('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8g9h0i', 'c123d456-e789-4f01-b234-567c89d01e2f', 'Regional Office', 'Midwest HQ', 'business_unit', 'RO-001', 'active', 'Milwaukee', 'a987f654-3210-4321-b098-76543c210987');

-- Create Projects Under Business Units
INSERT INTO projects (organization_id, name, description, type, code, status, parent_id, created_by) VALUES 
  -- GreenTech Solutions Projects
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'Solar Installation', 'Rooftop Solar Project', 'project', 'PRJ-001', 'active', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '8d1e3562-e274-4a7b-b81c-e827b42b4256'),
  ('d4c74453-0ca4-4c79-a245-1a3b7e11eca1', 'EV Fleet Transition', 'Vehicle Electrification', 'project', 'PRJ-002', 'draft', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'c92f4b31-97b3-4da7-b81c-e827b42b4259'),
  
  -- EcoManufacturing Projects
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'Process Optimization', 'Energy Efficiency Initiative', 'project', 'PRJ-003', 'active', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'f832c945-b123-4567-89ab-cdef01234567'),
  ('f892b455-d409-4c81-9328-952a2e6882e2', 'Logistics Efficiency', 'Route Optimization', 'project', 'PRJ-004', 'active', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8g', 'f832c945-b123-4567-89ab-cdef01234567'),
  
  -- Sustainable Retail Projects
  ('c123d456-e789-4f01-b234-567c89d01e2f', 'LED Lighting Upgrade', 'Store Lighting Retrofit', 'project', 'PRJ-005', 'active', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8g9h', 'a987f654-3210-4321-b098-76543c210987'),
  ('c123d456-e789-4f01-b234-567c89d01e2f', 'Waste Reduction', 'Zero Waste Program', 'project', 'PRJ-006', 'active', 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8g9h0i', 'a987f654-3210-4321-b098-76543c210987');

-- Create Project Members
INSERT INTO project_members (project_id, user_id, role) 
SELECT p.id, u.id, 'owner'
FROM projects p
CROSS JOIN auth.users u
WHERE p.created_by = u.id;
