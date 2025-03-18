
-- First, let's get an organization ID to reference
WITH org_id AS (
  SELECT id FROM organizations WHERE name = 'Green Corp' LIMIT 1
)
INSERT INTO materials (name, category, scope, unit, emission_factor, source, organization_id) 
VALUES 
  -- Scope 1 Materials
  ('Natural Gas', 'Stationary Combustion', 'scope1', 'm³', 2.02, 'GHG Protocol', (SELECT id FROM org_id)),
  ('Propane', 'Stationary Combustion', 'scope1', 'L', 1.54, 'GHG Protocol', (SELECT id FROM org_id)),
  ('Diesel', 'Mobile Combustion', 'scope1', 'L', 2.68, 'GHG Protocol', (SELECT id FROM org_id)),
  ('Gasoline', 'Mobile Combustion', 'scope1', 'L', 2.31, 'GHG Protocol', (SELECT id FROM org_id)),

  -- Scope 2 Materials
  ('Electricity', 'Purchased Energy', 'scope2', 'kWh', 0.42, 'EPA eGRID', (SELECT id FROM org_id)),
  ('Steam', 'Purchased Energy', 'scope2', 'MMBtu', 0.07, 'EPA', (SELECT id FROM org_id)),
  ('District Heating', 'Purchased Energy', 'scope2', 'MMBtu', 0.06, 'EPA', (SELECT id FROM org_id)),
  ('District Cooling', 'Purchased Energy', 'scope2', 'MMBtu', 0.04, 'EPA', (SELECT id FROM org_id)),

  -- Scope 3 Materials
  ('Air Travel - Short Haul', 'Business Travel', 'scope3', 'km', 0.14, 'DEFRA', (SELECT id FROM org_id)),
  ('Air Travel - Long Haul', 'Business Travel', 'scope3', 'km', 0.18, 'DEFRA', (SELECT id FROM org_id)),
  ('Hotel Stay', 'Business Travel', 'scope3', 'night', 31.3, 'DEFRA', (SELECT id FROM org_id)),
  ('Waste to Landfill', 'Waste Management', 'scope3', 'kg', 0.58, 'EPA', (SELECT id FROM org_id));
