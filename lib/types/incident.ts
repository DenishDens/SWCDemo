import type { Database } from '@/types/supabase'

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export type Incident = Database['public']['Tables']['incidents']['Row']
export type IncidentPrediction = Database['public']['Tables']['incident_predictions']['Row']
export type IncidentAuditLog = Database['public']['Tables']['incident_audit_logs']['Row']
export type IncidentComment = Database['public']['Tables']['incident_comments']['Row']
export type IncidentType = Database['public']['Tables']['incident_types']['Row']

export interface IncidentWithDetails extends Incident {
  organization_id: string
  business_unit_name?: string
  incident_type_name?: string
  creator_name?: string
}

export interface IncidentWithRelations extends Incident {
  project?: Database['public']['Tables']['projects']['Row']
  organization?: Database['public']['Tables']['organizations']['Row']
  reporter?: {
    id: string
    email: string
    name?: string
  }
  assignee?: {
    id: string
    email: string
    name?: string
  }
  comments?: IncidentComment[]
  predictions?: IncidentPrediction[]
  audit_logs?: IncidentAuditLog[]
}

export interface IncidentFilters {
  severity?: IncidentSeverity[]
  status?: IncidentStatus[]
  project_id?: string
  organization_id?: string
  reported_by?: string
  assigned_to?: string
  from_date?: string
  to_date?: string
  search?: string
}

export interface CreateIncidentParams {
  title: string
  description: string
  severity: IncidentSeverity
  project_id: string
  organization_id: string
  reported_by: string
  assigned_to?: string
}

export interface UpdateIncidentParams {
  title?: string
  description?: string
  severity?: IncidentSeverity
  status?: IncidentStatus
  assigned_to?: string | null
}