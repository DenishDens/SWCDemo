-- Create incident_types table for configurable incident types
CREATE TABLE IF NOT EXISTS public.incident_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users ON DELETE SET NULL,
  UNIQUE(organization_id, name)
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  incident_number SERIAL,
  business_unit_id uuid REFERENCES public.projects(id),
  incident_type_id uuid REFERENCES public.incident_types,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  location text,
  reported_at timestamptz DEFAULT timezone('utc'::text, now()),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users ON DELETE SET NULL
);

-- Create incident_comments table for tracking comments and closure notes
CREATE TABLE IF NOT EXISTS public.incident_comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  incident_id uuid REFERENCES public.incidents ON DELETE CASCADE,
  comment text NOT NULL,
  is_closure_note boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users ON DELETE SET NULL
);

-- Create incident_audit_log table for tracking all changes
CREATE TABLE IF NOT EXISTS public.incident_audit_log (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  incident_id uuid REFERENCES public.incidents ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  created_by uuid REFERENCES auth.users ON DELETE SET NULL
);

-- Create predictions table for AI-generated predictions
CREATE TABLE IF NOT EXISTS public.incident_predictions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  prediction_type text NOT NULL CHECK (prediction_type IN ('risk', 'pattern', 'prevention')),
  title text NOT NULL,
  description text,
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  expires_at timestamptz
);

-- Create a view to get the organization_id for the incidents through their project
CREATE OR REPLACE VIEW public.incidents_with_org AS
SELECT 
  i.*,
  p.organization_id,
  p.name as project_name,
  it.name as incident_type_name
FROM 
  public.incidents i
JOIN 
  public.projects p ON i.project_id = p.id
LEFT JOIN
  public.incident_types it ON i.incident_type_id = it.id;

-- Enable RLS on new tables
ALTER TABLE public.incident_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incident_types
CREATE POLICY "Users can view incident types in their organization" ON incident_types
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = incident_types.organization_id
    )
  );

CREATE POLICY "Admins can manage incident types" ON incident_types
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = incident_types.organization_id
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for incidents
CREATE POLICY "Users can view incidents in their organization" ON incidents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON p.organization_id = om.organization_id
      WHERE p.id = incidents.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage incidents" ON incidents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = incidents.project_id
      AND pm.user_id = auth.uid()
    )
  );

-- RLS Policies for incident_comments
CREATE POLICY "Users can view incident comments in their organization" ON incident_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM incidents i
      JOIN projects p ON i.project_id = p.id
      JOIN organization_members om ON p.organization_id = om.organization_id
      WHERE i.id = incident_comments.incident_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can add comments to incidents" ON incident_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM incidents i
      JOIN project_members pm ON i.project_id = pm.project_id
      WHERE i.id = incident_comments.incident_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments" ON incident_comments
  FOR UPDATE USING (
    auth.uid() = incident_comments.created_by
  );

-- RLS Policies for incident_audit_log
CREATE POLICY "Users can view incident audit logs in their organization" ON incident_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM incidents i
      JOIN projects p ON i.project_id = p.id
      JOIN organization_members om ON p.organization_id = om.organization_id
      WHERE i.id = incident_audit_log.incident_id
      AND om.user_id = auth.uid()
    )
  );

-- RLS Policies for incident_predictions
CREATE POLICY "Users can view predictions in their organization" ON incident_predictions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = incident_predictions.organization_id
    )
  );

-- Function to automatically create audit log entries
CREATE OR REPLACE FUNCTION public.fn_incident_audit_log() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.incident_audit_log(incident_id, action, details, created_by)
    VALUES(NEW.id, 'created', 
           jsonb_build_object('title', NEW.title, 'status', NEW.status, 'severity', NEW.severity),
           NEW.created_by);
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.incident_audit_log(incident_id, action, details, created_by)
    VALUES(NEW.id, 'updated', 
           jsonb_build_object(
             'changes', jsonb_build_object(
               'title', CASE WHEN NEW.title <> OLD.title THEN jsonb_build_object('old', OLD.title, 'new', NEW.title) ELSE NULL END,
               'status', CASE WHEN NEW.status <> OLD.status THEN jsonb_build_object('old', OLD.status, 'new', NEW.status) ELSE NULL END,
               'severity', CASE WHEN NEW.severity <> OLD.severity THEN jsonb_build_object('old', OLD.severity, 'new', NEW.severity) ELSE NULL END,
               'resolved_at', CASE WHEN (NEW.resolved_at IS NOT NULL AND OLD.resolved_at IS NULL) THEN jsonb_build_object('old', OLD.resolved_at, 'new', NEW.resolved_at) ELSE NULL END
             )
           ),
           NEW.updated_by);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for incident audit logging
DROP TRIGGER IF EXISTS tr_incident_audit_log ON public.incidents;
CREATE TRIGGER tr_incident_audit_log
AFTER INSERT OR UPDATE ON public.incidents
FOR EACH ROW EXECUTE FUNCTION public.fn_incident_audit_log();

-- Function to handle incident closure
CREATE OR REPLACE FUNCTION public.fn_close_incident(
  _incident_id uuid,
  _closure_note text
) RETURNS void AS $$
BEGIN
  -- Update the incident status to closed and set resolved_at
  UPDATE public.incidents
  SET 
    status = 'closed',
    resolved_at = COALESCE(resolved_at, NOW()),
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE id = _incident_id;
  
  -- Add the closure note
  INSERT INTO public.incident_comments (
    incident_id,
    comment,
    is_closure_note,
    created_by
  ) VALUES (
    _incident_id,
    _closure_note,
    true,
    auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 