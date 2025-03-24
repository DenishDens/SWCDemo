-- Create incident types table
CREATE TABLE IF NOT EXISTS public.incident_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(name, organization_id)
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'closed')) NOT NULL DEFAULT 'open',
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL DEFAULT 'medium',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  incident_type_id UUID REFERENCES public.incident_types(id),
  reported_by UUID REFERENCES auth.users(id),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for incident types
ALTER TABLE public.incident_types ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for incidents
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Incident types policies
CREATE POLICY "Incident types are viewable by organization members"
  ON public.incident_types
  FOR SELECT
  USING (
    EXISTS (
      select 1 from organization_members
      where organization_members.organization_id = incident_types.organization_id
      and organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Incident types can be managed by organization admins"
  ON public.incident_types
  FOR ALL
  USING (
    EXISTS (
      select 1 from organization_members
      where organization_members.organization_id = incident_types.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
  );

-- Incidents policies
CREATE POLICY "Incidents are viewable by organization members"
  ON public.incidents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN organization_members ON organization_members.organization_id = projects.organization_id
      WHERE projects.id = incidents.project_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Incidents can be managed by organization admins"
  ON public.incidents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN organization_members ON organization_members.organization_id = projects.organization_id
      WHERE projects.id = incidents.project_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role in ('owner', 'admin')
    )
  );

-- Add sample incidents
INSERT INTO public.incidents (title, description, status, severity, project_id)
VALUES
  ('Water Contamination', 'Possible chemical contamination detected in water samples from the eastern section of the bay.', 'investigating', 'high', '22221111-1111-1111-1111-111111111111'),
  ('Erosion Risk', 'Increased erosion observed at the northern shoreline following recent storms.', 'open', 'medium', '22221111-1111-1111-1111-111111111111'),
  ('Budget Overrun', 'Sustainable materials cost has exceeded initial estimates by 15%.', 'open', 'medium', '33331111-1111-1111-1111-111111111111'),
  ('Design Modification Request', 'Client has requested modifications to the rooftop garden design.', 'resolved', 'low', '33331111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;