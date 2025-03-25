import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Only allow this endpoint in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // First try to sign up the demo user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'demo@example.com',
      password: 'password123',
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    // Create profile for the demo user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: signUpData.user?.id,
          email: 'demo@example.com',
          full_name: 'Demo User',
          avatar_url: null,
          updated_at: new Date().toISOString(),
        },
      ])

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    // Create demo organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([
        {
          name: 'Demo Organization',
          description: 'A demo organization for testing',
          created_by: signUpData.user?.id,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (orgError) {
      console.error('Organization creation error:', orgError)
      return NextResponse.json(
        { error: orgError.message },
        { status: 400 }
      )
    }

    // Add user to organization as admin
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert([
        {
          organization_id: orgData.id,
          user_id: signUpData.user?.id,
          role: 'admin',
          created_at: new Date().toISOString(),
        },
      ])

    if (memberError) {
      console.error('Member creation error:', memberError)
      return NextResponse.json(
        { error: memberError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Demo user created successfully',
      userId: signUpData.user?.id,
      organizationId: orgData.id,
    })
  } catch (error) {
    console.error('Error setting up demo:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 