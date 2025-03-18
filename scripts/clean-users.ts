
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

    const { error: usersError } = await supabaseAdmin.auth.admin
      .deleteUsers('*')
    
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
