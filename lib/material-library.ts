
import { supabase } from './supabase'

export type Material = {
  id: string
  name: string
  category: string
  scope: string
  unit: string
  emission_factor: number
  source: string
  organization_id: string
  created_at?: string
  updated_at?: string
}

export async function getMaterials(organizationId: string) {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createMaterial(material: Omit<Material, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('materials')
    .insert(material)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateMaterial(id: string, material: Partial<Material>) {
  const { data, error } = await supabase
    .from('materials')
    .update(material)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteMaterial(id: string) {
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
