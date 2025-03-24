// Load environment variables
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Check if environment variables are loaded
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Exists (not showing for security)' : 'Missing')

// Create Supabase client directly here for testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      debug: true // Enable debug mode
    }
  }
)

async function testAuth() {
  try {
    console.log('Testing authentication...')
    
    // Try signing in with demo credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'password123'
    })
    
    if (error) {
      console.error('Authentication error:', error.message)
      if (error.stack) {
        console.error('Error stack:', error.stack)
      }
    } else {
      console.log('Authentication successful!')
      console.log('User:', data.user?.email)
    }
  } catch (e) {
    console.error('Unexpected error:', e)
  }
}

testAuth() 