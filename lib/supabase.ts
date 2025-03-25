import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Show connection info in console
console.log('Supabase URL:', supabaseUrl)
console.log('Connecting to Supabase...')

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     !process.env.NODE_ENV || 
                     supabaseUrl.includes('127.0.0.1') || 
                     supabaseUrl.includes('localhost')

if (isDevelopment) {
  console.log('Running in development mode with local Supabase')
}

// Helper function to retry failed requests
const retryRequest = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request... (${retries} attempts left)`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1, delay * 1.5)
    }
    throw error
  }
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public'
  },
  global: {
    fetch: (...args) => {
      // Custom fetch with timeout and error handling
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('Supabase request timed out')
          // For auth endpoints, we want to reject so auth error handling can kick in
          if (args[0].toString().includes('/auth/')) {
            reject(new Error('Network timeout for auth request'))
            return
          }
          
          // For other requests, return empty data
          resolve(new Response(JSON.stringify({ data: null, error: { message: 'Network timeout' } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }))
        }, isDevelopment ? 5000 : 10000) // Longer timeout in development for initial connection
        
        retryRequest(() => fetch(...args), 3)
          .then(response => {
            clearTimeout(timeout)
            resolve(response)
          })
          .catch(error => {
            clearTimeout(timeout)
            console.warn('Supabase fetch error:', error)
            
            // For auth endpoints, we want to reject so auth error handling can kick in
            if (args[0].toString().includes('/auth/')) {
              reject(error)
              return
            }
            
            // For other requests, return empty data with error
            resolve(new Response(JSON.stringify({ data: null, error: { message: 'Database connection error. Please try again.' } }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }))
          })
      })
    }
  }
})

// If in browser environment, check for existing sessions
if (typeof window !== 'undefined') {
  // Handle auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, !!session)
  })
  
  // Check connection with retry
  const checkConnection = async () => {
    try {
      const { count, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
      if (error) {
        throw error
      }
      console.log('Supabase connected successfully. Profile count:', count)
    } catch (err) {
      console.warn('Initial connection check failed, retrying...')
      // Wait for a moment and retry
      await new Promise(resolve => setTimeout(resolve, 2000))
      try {
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
        if (error) {
          console.error('Supabase connection check failed after retry:', error.message)
        } else {
          console.log('Supabase connected successfully after retry')
        }
      } catch (retryErr) {
        console.error('Supabase connection test failed after retry:', retryErr)
      }
    }
  }
  
  checkConnection()
}

// Export for easy access
export default supabase

// Schema is managed through Supabase dashboard
