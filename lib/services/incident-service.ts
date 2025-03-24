import { supabase } from '@/lib/supabase'
import {
  Incident,
  IncidentWithDetails,
  IncidentComment,
  IncidentAuditLog,
  IncidentType,
  IncidentPrediction,
  CreateIncidentParams,
  UpdateIncidentParams,
  CloseIncidentParams,
  CreateCommentParams,
  IncidentFilterParams,
} from '@/lib/types/incident'

export const incidentService = {
  // Incident Types
  async getIncidentTypes(): Promise<IncidentType[]> {
    const { data, error } = await supabase
      .from('incident_types')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async createIncidentType(name: string, description?: string): Promise<IncidentType> {
    const { data, error } = await supabase
      .from('incident_types')
      .insert({
        name,
        description,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateIncidentType(id: string, name: string, description?: string): Promise<IncidentType> {
    const { data, error } = await supabase
      .from('incident_types')
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteIncidentType(id: string): Promise<void> {
    const { error } = await supabase
      .from('incident_types')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Incidents
  async getIncidents(filters?: IncidentFilterParams): Promise<IncidentWithDetails[]> {
    let query = supabase
      .from('incidents_with_org')
      .select('*')
    
    if (filters) {
      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id)
      }
      if (filters.business_unit_id) {
        query = query.eq('business_unit_id', filters.business_unit_id)
      }
      if (filters.incident_type_id) {
        query = query.eq('incident_type_id', filters.incident_type_id)
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.from_date) {
        query = query.gte('reported_at', filters.from_date)
      }
      if (filters.to_date) {
        query = query.lte('reported_at', filters.to_date)
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }
    }

    const { data, error } = await query.order('incident_number', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getIncidentById(id: string): Promise<IncidentWithDetails> {
    const { data, error } = await supabase
      .from('incidents_with_org')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createIncident(params: CreateIncidentParams): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        project_id: params.project_id,
        title: params.title,
        description: params.description,
        business_unit_id: params.business_unit_id,
        incident_type_id: params.incident_type_id,
        severity: params.severity,
        location: params.location,
        reported_at: params.reported_at || new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateIncident(id: string, params: UpdateIncidentParams): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .update({
        ...params,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async closeIncident(params: CloseIncidentParams): Promise<void> {
    const { error } = await supabase
      .rpc('fn_close_incident', {
        _incident_id: params.incident_id,
        _closure_note: params.closure_note,
      })
    
    if (error) throw error
  },

  // Comments
  async getIncidentComments(incidentId: string): Promise<IncidentComment[]> {
    const { data, error } = await supabase
      .from('incident_comments')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at')
    
    if (error) throw error
    return data || []
  },

  async createComment(params: CreateCommentParams): Promise<IncidentComment> {
    const { data, error } = await supabase
      .from('incident_comments')
      .insert({
        incident_id: params.incident_id,
        comment: params.comment,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Audit Log
  async getIncidentAuditLog(incidentId: string): Promise<IncidentAuditLog[]> {
    const { data, error } = await supabase
      .from('incident_audit_log')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // AI Predictions
  async getIncidentPredictions(): Promise<IncidentPrediction[]> {
    const { data, error } = await supabase
      .from('incident_predictions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async generatePredictions(organizationId: string): Promise<IncidentPrediction[]> {
    // This would typically call an external AI service
    // For now we'll just create a mock prediction
    const mockPrediction = {
      organization_id: organizationId,
      prediction_type: 'risk' as const,
      title: 'Potential fuel spill risk detected',
      description: 'Based on historical incidents, there is a high risk of fuel spills during equipment refueling at Hobart Waterfront Development.',
      confidence_score: 0.85,
      details: {
        affected_areas: ['Hobart Waterfront Development'],
        contributing_factors: ['Equipment maintenance', 'Operator training'],
        recommendation: 'Implement additional safety measures during refueling operations and conduct refresher training for equipment operators.',
      },
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    }

    const { data, error } = await supabase
      .from('incident_predictions')
      .insert(mockPrediction)
      .select()
    
    if (error) throw error
    return data || []
  },
} 