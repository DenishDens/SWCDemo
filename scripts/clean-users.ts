
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
    // Clean existing data
    const { error: profilesError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (profilesError) throw profilesError

    // Get all users first
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    
    // Delete each user
    for (const user of users.users) {
      const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (userError) throw userError
    }
    
    if (usersError) throw usersError

    // Read and execute schema.sql
    const fs = require('fs')
    const schema = fs.readFileSync('supabase/schema.sql', 'utf8')
    const { error: schemaError } = await supabaseAdmin.rpc('exec_sql', { sql: schema })
    if (schemaError) throw schemaError

    console.log('Successfully cleaned users and reset schema')
  } catch (error) {
    console.error('Error:', error)
  }
}

cleanUsers()
