const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

async function createUser() {
  try {
    console.log('Signing up a new user')
    const { data, error } = await supabase.auth.signUp({
      email: 'demo@example.com',
      password: 'password123'
    })

    if (error) {
      console.error('Error creating user:', error.message)
    } else {
      console.log('User created successfully:', data)
    }

    // Try signing in with the newly created user
    console.log('\nTrying to sign in with the new user')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'password123'
    })

    if (signInError) {
      console.error('Error signing in:', signInError.message)
    } else {
      console.log('Sign in successful:', signInData)
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createUser() 