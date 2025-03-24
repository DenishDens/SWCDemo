export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          type: 'business_unit' | 'project'
          code: string
          status: 'active' | 'inactive' | 'draft'
          location: string | null
          parent_id: string | null
          emissions_data: Json | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          type: 'business_unit' | 'project'
          code: string
          status?: 'active' | 'inactive' | 'draft'
          location?: string | null
          parent_id?: string | null
          emissions_data?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          type?: 'business_unit' | 'project'
          code?: string
          status?: 'active' | 'inactive' | 'draft'
          location?: string | null
          parent_id?: string | null
          emissions_data?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      uploads: {
        Row: {
          id: string
          project_id: string
          name: string
          size: number
          status: 'processing' | 'completed' | 'failed'
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          size: number
          status?: 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          size?: number
          status?: 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      incidents: {
        Row: {
          id: string
          title: string
          description: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          project_id: string
          organization_id: string
          reported_by: string
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          project_id: string
          organization_id: string
          reported_by: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          project_id?: string
          organization_id?: string
          reported_by?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      incident_predictions: {
        Row: {
          id: string
          incident_id: string
          model: string
          prediction: string
          confidence: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          model: string
          prediction: string
          confidence: number
          metadata: Json
          created_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          model?: string
          prediction?: string
          confidence?: number
          metadata?: Json
          created_at?: string
        }
      }
      incident_audit_logs: {
        Row: {
          id: string
          incident_id: string
          action: string
          details: Json
          performed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          action: string
          details: Json
          performed_by: string
          created_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          action?: string
          details?: Json
          performed_by?: string
          created_at?: string
        }
      }
      incident_comments: {
        Row: {
          id: string
          incident_id: string
          content: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          content: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          content?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      incident_types: {
        Row: {
          id: string
          name: string
          description: string
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          organization_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          organization_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
