import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Exists (not showing for security)' : 'Missing')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

async function checkUsers() {
  try {
    // Check organization members
    const { data: orgMembers, error: orgError } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        organization:organizations(id, name),
        user:users(email)
      `)
      .eq('role', 'owner')

    if (orgError) {
      console.error('Error querying organization members:', orgError)
      return
    }

    console.log('Organization owners:', orgMembers)

    // Check project members
    const { data: projectMembers, error: projectError } = await supabase
      .from('project_members')
      .select(`
        id,
        role,
        project:projects(id, name, type),
        user:users(email)
      `)
      .eq('role', 'owner')

    if (projectError) {
      console.error('Error querying project members:', projectError)
      return
    }

    console.log('Project owners:', projectMembers)

  } catch (error) {
    console.error('Error checking users:', error)
  }
}

checkUsers()