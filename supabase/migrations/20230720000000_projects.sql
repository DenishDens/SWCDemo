-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'draft')) NOT NULL DEFAULT 'draft',
  type TEXT NOT NULL DEFAULT 'project',
  code TEXT,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Initially, only allow admin access
-- We'll update this policy after project_members table is created
CREATE POLICY "Initial projects access policy"
  ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add two sample projects
INSERT INTO public.projects (id, name, description, status, type, code)
VALUES
  ('22221111-1111-1111-1111-111111111111', 'Brisbane Bay Restoration', 'Ecological restoration project to rehabilitate coastal areas and improve biodiversity.', 'active', 'project', 'BBR-2023'),
  ('33331111-1111-1111-1111-111111111111', 'Melbourne Green Office Complex', 'Construction of a LEED-certified commercial office building with sustainable design features.', 'draft', 'project', 'MGOC-2023')
ON CONFLICT (id) DO NOTHING; 