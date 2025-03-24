import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function createDemoOrganization(supabase: any, userId: string, userName: string) {
  const orgName = `${userName}'s Demo Organization`
  // Generate slug from name (lowercase, replace non-alphanumeric with dash)
  const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-')
  
  try {
    // Create the organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({ 
        name: orgName, 
        slug,
        is_demo: true,
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orgError) {
      console.error('Error creating demo organization:', orgError)
      throw orgError
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: userId,
        role: 'owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (memberError) {
      console.error('Error adding user as owner:', memberError)
      
      // If membership creation fails, clean up by deleting the organization
      await supabase
        .from('organizations')
        .delete()
        .eq('id', organization.id)
        
      throw memberError
    }

    return organization
  } catch (error) {
    console.error('Failed to create demo organization:', error)
    return null
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  let isNewUser = false

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the newly authenticated user
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!error && user) {
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

        // Extract name from user metadata or use default
        const fullName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'User'

        // Create default profile
        await supabase
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
        
        // Extract name for organization
        const fullName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'User'
                         
        await createDemoOrganization(supabase, user.id, fullName)
      }
    }
  }

  // Redirect to the dashboard (no need to send to settings since we've created an org)
  return NextResponse.redirect(new URL('/dashboard', request.url))
} 