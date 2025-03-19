const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function main() {
  try {
    // Clean up existing users
    console.log('Cleaning up existing users...')
    const { data: existingUsers, error: getUsersError } = await supabaseAdmin.auth.admin.listUsers()
    if (getUsersError) throw getUsersError

    for (const user of existingUsers.users) {
      console.log(`Deleting user ${user.email}...`)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (deleteError) throw deleteError
    }

    // Create test user 1
    console.log('\nCreating admin@example.com...')
    const { data: admin, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { name: 'Admin User' }
    })
    if (adminError) throw adminError
    console.log('Admin created:', admin)

    // Create test user 2
    console.log('\nCreating user@example.com...')
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: 'user@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { name: 'Regular User' }
    })
    if (userError) throw userError
    console.log('User created:', user)

    console.log('\nUsers created successfully!')
  } catch (error) {
    console.error('Error:', error)
  }
}

main() 