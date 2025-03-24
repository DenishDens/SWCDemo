import { supabase } from '../supabase'

export type Organization = {
  id: string
  name: string
  slug: string
  created_at?: string
  updated_at?: string
  is_demo?: boolean
  trial_ends_at?: string
}

export type OrganizationWithRole = Organization & {
  role: 'owner' | 'admin' | 'member'
}

export type OrganizationMember = {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at?: string
  updated_at?: string
}

type DatabaseOrganization = {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
  is_demo?: boolean
  trial_ends_at?: string
}

type DatabaseOrganizationMembership = {
  organization_id: string
  role: 'owner' | 'admin' | 'member'
  organizations: DatabaseOrganization
}

type DatabaseOrganizationMember = {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
  updated_at: string
  profiles: {
    email: string
    full_name: string
  }
}

export async function getCurrentUserOrganizations(): Promise<OrganizationWithRole[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !user.id) {
      console.error('Auth error or no user found:', authError || 'No valid user')
      return []
    }
    
    const { data: memberships, error: membershipError } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          slug,
          created_at,
          updated_at,
          is_demo,
          trial_ends_at
        )
      `)
      .eq('user_id', user.id)

    if (membershipError) {
      console.log('No organization memberships found or error for user:', user.id)
      return []
    }
    
    if (!memberships || memberships.length === 0) {
      return []
    }
    
    return (memberships as unknown as DatabaseOrganizationMembership[]).map(m => ({
      id: m.organizations.id,
      name: m.organizations.name,
      slug: m.organizations.slug,
      created_at: m.organizations.created_at,
      updated_at: m.organizations.updated_at,
      is_demo: m.organizations.is_demo,
      trial_ends_at: m.organizations.trial_ends_at,
      role: m.role
    }))
  } catch (error) {
    console.error('Error in getCurrentUserOrganizations:', error)
    return []
  }
}

export async function createOrganization(name: string): Promise<Organization> {
  try {
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    
    // Create the organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({ 
        name, 
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orgError) {
      console.error('Error creating organization:', orgError)
      throw orgError
    }

    if (!organization) {
      throw new Error('Failed to create organization - no data returned')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      throw new Error('Failed to get current user')
    }

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (memberError) {
      console.error('Error adding user as owner:', memberError)
      throw memberError
    }

    return organization
  } catch (error) {
    console.error('Error in createOrganization:', error)
    throw error
  }
}

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      organization_id,
      user_id,
      role,
      created_at,
      updated_at,
      profiles (
        email,
        full_name
      )
    `)
    .eq('organization_id', organizationId)

  if (error) throw error
  return (data as unknown as DatabaseOrganizationMember[]).map(m => ({
    id: m.id,
    organization_id: m.organization_id,
    user_id: m.user_id,
    role: m.role,
    created_at: m.created_at,
    updated_at: m.updated_at
  }))
}

export async function inviteToOrganization(organizationId: string, email: string, role: 'admin' | 'member' = 'member'): Promise<void> {
  // First check if user exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!existingUser) {
    // TODO: Implement email invitation system
    throw new Error('User not found. Email invitation system not implemented yet.')
  }

  // Add user to organization
  const { error } = await supabase
    .from('organization_members')
    .insert({
      organization_id: organizationId,
      user_id: existingUser.id,
      role
    })

  if (error) throw error
}

export async function updateMemberRole(memberId: string, role: 'admin' | 'member'): Promise<void> {
  const { error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('id', memberId)

  if (error) throw error
}

export async function removeMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('id', memberId)

  if (error) throw error
}

export async function leaveOrganization(organizationId: string): Promise<void> {
  const userId = (await supabase.auth.getUser()).data.user?.id
  
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function generateOrganizationInviteCode(organizationId: string): Promise<string> {
  try {
    // Generate a random code - 8 characters alphanumeric
    const generateRandomCode = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    };
    
    const code = generateRandomCode();
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Failed to authenticate user');
    }
    
    if (!user) {
      throw new Error('You must be logged in to generate invite codes');
    }
    
    // Create the invite record
    const { data, error } = await supabase
      .from('organization_invites')
      .insert({
        organization_id: organizationId,
        code: code,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('code')
      .single();
    
    if (error) {
      console.error('Error creating invite:', error);
      throw error;
    }
    
    return data.code;
  } catch (error) {
    console.error('Error in generateOrganizationInviteCode:', error);
    throw error;
  }
}

export async function getOrganizationInvites(organizationId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('organization_invites')
      .select(`
        id,
        code,
        organization_id,
        created_by,
        expires_at,
        created_at,
        updated_at,
        user:created_by (
          email
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching invites:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getOrganizationInvites:', error);
    return [];
  }
}
