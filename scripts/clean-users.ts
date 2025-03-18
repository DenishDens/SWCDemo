
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function cleanUsers() {
  try {
    const { error: profilesError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (profilesError) throw profilesError

    const { error: usersError } = await supabaseAdmin.auth.admin
      .deleteUsers('*')
    
    if (usersError) throw usersError

    console.log('Successfully cleaned users and profiles')
  } catch (error) {
    console.error('Error cleaning users:', error)
  }
}

cleanUsers()
