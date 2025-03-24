-- Create project_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Add RLS policies for project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own project memberships
CREATE POLICY "Users can view their own project memberships"
  ON public.project_members
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to manage all project memberships
CREATE POLICY "Admins can manage all project memberships"
  ON public.project_members
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add role column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Drop the initial projects policy and create the proper one
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Initial projects access policy'
  ) THEN
    DROP POLICY "Initial projects access policy" ON public.projects;
  END IF;
END $$;

-- Create the proper projects access policy
CREATE POLICY "Users can view their projects"
  ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop the initial incidents policy and create the proper one
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Initial incidents access policy'
  ) THEN
    DROP POLICY "Initial incidents access policy" ON public.incidents;
  END IF;
END $$;

-- Create the proper incidents access policy
CREATE POLICY "Users can view incidents for their projects"
  ON public.incidents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = incidents.project_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add demo project access for the demo user
INSERT INTO public.project_members (user_id, project_id, role)
SELECT 
  id,
  '22221111-1111-1111-1111-111111111111',
  'viewer'
FROM auth.users
WHERE email = 'demo@example.com'
ON CONFLICT (user_id, project_id) DO NOTHING;

-- For testing purposes, also give access to the second project
INSERT INTO public.project_members (user_id, project_id, role)
SELECT 
  id,
  '33331111-1111-1111-1111-111111111111',
  'editor'
FROM auth.users
WHERE email = 'demo@example.com'
ON CONFLICT (user_id, project_id) DO NOTHING; 