import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from "@supabase/supabase-js"

// Helper function to create a demo organization for a new user
async function createDemoOrganization(
  supabase: SupabaseClient,
  userId: string,
  userName: string
) {
  // Create the organization
  const orgName = `${userName}'s Organization`
  
  const { data: organization, error: createOrgError } = await supabase
    .from('organizations')
    .insert({
      name: orgName,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_personal: true,
      plan: 'free',
      settings: {
        showTutorial: true,
        defaultView: 'list',
        theme: 'system'
      }
    })
    .select('id')
    .single()
    
  if (createOrgError) {
    console.error('Error creating demo organization:', createOrgError.message)
    throw createOrgError
  }
  
  // Add the user as an admin to the organization
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: organization.id,
      user_id: userId,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
  if (memberError) {
    console.error('Error adding user to organization:', memberError.message)
    throw memberError
  }
  
  return organization
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  let isNewUser = false

  if (!code) {
    // No code parameter, redirect to login
    console.error('No code provided in auth callback')
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError.message)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url))
    }

    // Get the newly authenticated user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('Error getting session after code exchange:', sessionError?.message || 'No session created')
      return NextResponse.redirect(new URL('/login?error=session_error', request.url))
    }

    const user = session.user

    // Check if the user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // If the user doesn't have a profile, create one
    if (profileError && profileError.code === 'PGRST116') {
      // This is a new user
      isNewUser = true

      try {
        // Extract name from user metadata or use default
        const fullName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'User'

        // Create default profile
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            notification_settings: {
              emailSummary: true,
              newUploads: true,
              teamChanges: true,
              emissionAlerts: true,
              productUpdates: false,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError.message)
          // Continue anyway - the user can set up their profile later
        }
      } catch (profileCreationError) {
        console.error('Unexpected error creating profile:', profileCreationError)
        // Continue anyway - the user can set up their profile later
      }
    }

    // Check if user has any organizations
    const { data: orgMemberships, error: orgError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (!orgError && (!orgMemberships || orgMemberships.length === 0)) {
      // User has no organizations - create a demo organization
      isNewUser = true
      
      try {
        // Extract name for organization
        const fullName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        'User'
                        
        await createDemoOrganization(supabase, user.id, fullName)
      } catch (demoOrgError) {
        console.error('Error creating demo organization:', demoOrgError)
        // Continue anyway - the user can create an organization later
      }
    }

    // Redirect to the dashboard with success message
    const redirectUrl = new URL('/dashboard', request.url)
    if (isNewUser) {
      redirectUrl.searchParams.set('welcome', 'true')
    }
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url))
  }
} 