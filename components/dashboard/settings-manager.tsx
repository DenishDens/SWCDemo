"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { User, Building, Bell, Key, Lock, Globe, Upload, RefreshCw, Copy, Eye, EyeOff, AlertTriangle, UserPlus, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { IncidentTypesManager } from "@/components/incidents/incident-types-manager"
import { generateOrganizationInviteCode, getOrganizationInvites } from "@/lib/services/organization-service"

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isResetApiKeyDialogOpen, setIsResetApiKeyDialogOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false)
  const [isJoinOrgDialogOpen, setIsJoinOrgDialogOpen] = useState(false)
  const [showOrgChoice, setShowOrgChoice] = useState(false)
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    slug: ""
  })
  const [joinCode, setJoinCode] = useState("")
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    job_title: "",
    phone: "",
    org_name: "",
    org_industry: "",
    org_size: "",
    org_address: "",
    org_website: "",
  })
  const [loading, setLoading] = useState(true)
  const [notificationSettings, setNotificationSettings] = useState({
    emailSummary: true,
    newUploads: true,
    teamChanges: true,
    emissionAlerts: true,
    productUpdates: false,
  })
  const { toast } = useToast()
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)
  const [invites, setInvites] = useState<any[]>([])
  const [generatingInvite, setGeneratingInvite] = useState(false)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [upgradeOrgData, setUpgradeOrgData] = useState({
    name: "",
    slug: ""
  })

  // API Key mock - in a real app this would be stored/generated securely
  const apiKey = "carb_sk_1234567890abcdefghijklmnopqrstuvwxyz"

  const fetchUserOrganizations = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Error fetching user data:', authError)
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      if (!user || !user.id) {
        console.error('No valid user found', user)
        toast({
          title: "Error",
          description: "No valid user found. Please sign in again.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      try {
        const { data: memberships, error: membershipError } = await supabase
          .from('organization_members')
          .select(`
            organization:organizations (
              id,
              name,
              slug,
              created_at,
              updated_at
            ),
            role,
            created_at,
            updated_at
          `)
          .eq('user_id', user.id)

        // For a new user, this might return an error if they don't have any memberships
        // But this isn't a critical error - just means they need to create an organization
        if (membershipError) {
          console.log('No organization memberships found for new user:', user.id)
          setOrganizations([])
          setShowOrgChoice(true)
          setActiveTab("organization")
          setLoading(false)
          return
        }

        const userOrganizations = memberships?.map(m => ({
          ...m.organization,
          role: m.role
        })) || []

        setOrganizations(userOrganizations)
        
        // Show organization choice dialog if user has no organizations
        if (userOrganizations.length === 0) {
          setShowOrgChoice(true)
          setActiveTab("organization")
        } else {
          setShowOrgChoice(false)
        }
      } catch (error) {
        console.error('Error processing organizations:', error)
        // Even if there's an error, we'll set an empty array to avoid undefined errors
        setOrganizations([])
        setShowOrgChoice(true)
        setActiveTab("organization")
      }
    } catch (error) {
      console.error('Error in fetchUserOrganizations:', error)
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive"
      })
      // Set empty organizations to avoid undefined errors
      setOrganizations([])
      setShowOrgChoice(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeUser = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          toast({
            title: "Authentication Error",
            description: "Please sign in again",
            variant: "destructive"
          })
          setLoading(false)
          return
        }
        
        if (data?.session?.user) {
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError)
          } else if (profile) {
            // Set user profile
            setUserProfile(profile)
            
            // Set form data from profile
            setFormData({
              full_name: profile.full_name || '',
              email: data.session.user.email || '',
              job_title: profile.job_title || '',
              phone: profile.phone || '',
              org_name: profile.org_name || '',
              org_industry: profile.org_industry || '',
              org_size: profile.org_size || '',
              org_address: profile.org_address || '',
              org_website: profile.org_website || '',
            })
            
            // Set notification settings from profile
            if (profile.notification_settings) {
              setNotificationSettings(profile.notification_settings)
            }
          }
          
          // Only fetch organizations if we have an authenticated user
          fetchUserOrganizations()
        } else {
          console.log('No active session found')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing user:', error)
        setLoading(false)
      }
    }
    
    initializeUser()
  }, [])

  // Check URL params for tab selection
  useEffect(() => {
    // Check if URL has tab parameter
    const searchParams = new URLSearchParams(window.location.search)
    const tabParam = searchParams.get('tab')
    
    if (tabParam && ['profile', 'organization', 'incident-types', 'notifications', 'api', 'security'].includes(tabParam)) {
      setActiveTab(tabParam)
    } else if (organizations.length === 0) {
      // If no tab specified and user has no organizations, default to organization tab
      setActiveTab("organization")
    }
  }, [organizations])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const getUserInitials = () => {
    if (!formData.full_name) return "U";
    return formData.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  const saveProfileChanges = async () => {
    try {
      const { data, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        toast({
          title: "Authentication Error",
          description: "Failed to get current user",
          variant: "destructive"
        })
        return
      }
      
      if (!data || !data.user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive"
        })
        return
      }
      
      const user = data.user;
      console.log('User from auth:', user);

      // Prepare profile data, ensuring no undefined values
      const profileData = {
        id: user.id,
        full_name: formData.full_name || "",
        job_title: formData.job_title || "",
        phone: formData.phone || "",
        org_name: formData.org_name || "",
        org_industry: formData.org_industry || "",
        org_size: formData.org_size || "",
        org_address: formData.org_address || "",
        org_website: formData.org_website || "",
        notification_settings: notificationSettings || {
          emailSummary: true,
          newUploads: true,
          teamChanges: true,
          emissionAlerts: true,
          productUpdates: false,
        },
      }
      
      console.log('Profile data to save:', profileData);

      try {
        // Check if the profile exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking profile existence:', checkError)
          
          // Try to insert a new profile anyway
          console.log('Attempting to insert new profile despite check error');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData)
            
          if (insertError) {
            console.error('Failed to create profile after check error:', insertError)
            toast({
              title: "Error",
              description: `Failed to save profile: ${insertError.message}`,
              variant: "destructive"
            })
            return
          }
          
          toast({
            title: "Success",
            description: "New profile created successfully",
          })
          return
        }

        // Decide whether to update or insert
        if (existingProfile) {
          // Update existing profile
          console.log('Updating existing profile for user:', user.id)
          const { error: updateError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id)
          
          if (updateError) {
            console.error('Update error:', updateError)
            toast({
              title: "Error",
              description: `Failed to update profile: ${updateError.message}`,
              variant: "destructive"
            })
            return
          }
          
          console.log('Profile updated successfully');
        } else {
          // Insert new profile
          console.log('Creating new profile for user:', user.id)
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData)
          
          if (insertError) {
            console.error('Insert error:', insertError)
            toast({
              title: "Error",
              description: `Failed to create profile: ${insertError.message}`,
              variant: "destructive"
            })
            return
          }
          
          console.log('New profile created successfully');
        }

        // Refresh the profile data
        const { data: refreshedProfile, error: refreshError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (refreshError) {
          console.error('Error refreshing profile:', refreshError)
        } else if (refreshedProfile) {
          console.log('Retrieved refreshed profile:', refreshedProfile)
          setUserProfile(refreshedProfile)
        }

        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        toast({
          title: "Error",
          description: "Failed to update profile data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    })
  }

  const resetApiKey = () => {
    setIsResetApiKeyDialogOpen(false)
    // In a real app, this would generate a new API key
    toast({
      title: "API Key Reset",
      description: "Your API key has been reset",
    })
  }

  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof notificationSettings]
    }))
  }

  const saveNotificationSettings = async () => {
    try {
      const { data, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        toast({
          title: "Authentication Error",
          description: "Failed to get current user",
          variant: "destructive"
        })
        return
      }
      
      if (!data || !data.user) {
        toast({
          title: "Error",
          description: "You must be logged in to update notification settings",
          variant: "destructive"
        })
        return
      }
      
      const user = data.user;

      try {
        // First check if a profile exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error('Error checking profile existence:', checkError)
          toast({
            title: "Error",
            description: "Failed to check if profile exists",
            variant: "destructive"
          })
          return
        }

        const profileData = {
          id: user.id,
          notification_settings: notificationSettings,
        }

        let error
        
        if (existingProfile) {
          // Update existing profile
          console.log('Updating existing profile for user:', user.id)
          const { error: updateError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id)
            
          error = updateError
        } else {
          // Insert new profile
          console.log('Creating new profile for user:', user.id)
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              ...profileData,
              full_name: user.user_metadata?.name || "User"
            })
            
          error = insertError
        }

        if (error) {
          console.error('Error saving notification settings:', error)
          toast({
            title: "Error",
            description: `Failed to save notification settings: ${error.message}`,
            variant: "destructive"
          })
          return
        }

        // Refresh the profile data
        const { data: refreshedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (refreshedProfile) {
          setUserProfile(refreshedProfile)
        }

        toast({
          title: "Success",
          description: "Notification settings updated successfully",
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        toast({
          title: "Error",
          description: "Failed to update notification settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    }
  }

  const handleCreateOrganization = async () => {
    try {
      if (!newOrgData.name) {
        toast({
          title: "Error",
          description: "Organization name is required",
          variant: "destructive"
        })
        return
      }

      const { data, error: authError } = await supabase.auth.getSession()
      
      if (authError || !data?.session?.user?.id) {
        console.error('Auth error or no user found:', authError || 'No valid user')
        toast({
          title: "Authentication Error",
          description: "Please sign in again",
          variant: "destructive"
        })
        return
      }

      const user = data.session.user

      // Generate slug if not provided
      let slug = newOrgData.slug || newOrgData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      // Check if the slug already exists
      try {
        const { data: existingOrgs, error: checkError } = await supabase
          .from('organizations')
          .select('slug')
          .eq('slug', slug)
        
        if (checkError) {
          console.error('Error checking existing organizations:', checkError)
          toast({
            title: "Error",
            description: "Failed to check organization slug",
            variant: "destructive"
          })
          return
        }
        
        // If there's already an org with this slug, make it unique
        if (existingOrgs && existingOrgs.length > 0) {
          // Add a random suffix
          const randomSuffix = Math.floor(Math.random() * 1000)
          slug = `${slug}-${randomSuffix}`
          
          toast({
            title: "Info",
            description: `Organization slug was modified to ${slug} to ensure uniqueness`
          })
        }
        
        // Create the organization
        const { data: org, error: createError } = await supabase
          .from('organizations')
          .insert({
            name: newOrgData.name,
            slug: slug,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single()

        if (createError) {
          console.error('Error creating organization:', createError)
          toast({
            title: "Error",
            description: createError.message || "Failed to create organization",
            variant: "destructive"
          })
          return
        }

        if (!org) {
          console.error('No organization data returned')
          toast({
            title: "Error",
            description: "Failed to create organization - no data returned",
            variant: "destructive"
          })
          return
        }

        // Try to add the creator as owner
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: org.id,
            user_id: user.id,
            role: 'owner',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (memberError) {
          console.error('Error adding member:', memberError)
          
          // If we couldn't add the member, we should delete the org
          await supabase
            .from('organizations')
            .delete()
            .eq('id', org.id)
            
          toast({
            title: "Error",
            description: memberError.message || "Failed to add user to organization",
            variant: "destructive"
          })
          return
        }

        // Update local state immediately
        const newOrg = { 
          id: org.id,
          name: org.name,
          slug: org.slug,
          created_at: org.created_at,
          updated_at: org.updated_at,
          role: 'owner' 
        }
        setOrganizations(prev => [...prev, newOrg])
        
        // Close dialogs
        setIsCreateOrgDialogOpen(false)
        setShowOrgChoice(false)
        
        // Reset form
        setNewOrgData({
          name: "",
          slug: ""
        })

        toast({
          title: "Success",
          description: "Organization created successfully",
        })
      } catch (error: any) {
        console.error('Error in organization creation process:', error)
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred while creating the organization",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('Error in handleCreateOrganization:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create organization",
        variant: "destructive"
      })
    }
  }

  const handleJoinOrganization = async () => {
    try {
      if (!joinCode) {
        toast({
          title: "Error",
          description: "Invite code is required",
          variant: "destructive"
        })
        return
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Error fetching user data:', authError)
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive"
        })
        return
      }

      if (!user || !user.id) {
        console.error('No valid user found', user)
        toast({
          title: "Error",
          description: "No valid user found. Please sign in again.",
          variant: "destructive"
        })
        return
      }

      // Find the invite and get organization details
      const { data: invite, error: inviteError } = await supabase
        .from('organization_invites')
        .select(`
          organization_id,
          organization:organizations (
            id,
            name,
            slug,
            created_at,
            updated_at
          )
        `)
        .eq('code', joinCode)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no data found

      if (inviteError) {
        console.error('Error finding invite:', inviteError)
        toast({
          title: "Error",
          description: "Invalid invite code or error retrieving invitation",
          variant: "destructive"
        })
        return
      }

      if (!invite || !invite.organization_id) {
        toast({
          title: "Error",
          description: "Invalid invite code. Please check and try again.",
          variant: "destructive"
        })
        return
      }

      // Check if already a member
      try {
        const { data: existingMember, error: memberCheckError } = await supabase
          .from('organization_members')
          .select('id')
          .eq('organization_id', invite.organization_id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (memberCheckError) {
          console.error('Error checking membership:', memberCheckError)
          toast({
            title: "Error",
            description: "Failed to check existing membership",
            variant: "destructive"
          })
          return
        }
        
        if (existingMember) {
          toast({
            title: "Error",
            description: "You are already a member of this organization",
            variant: "destructive"
          })
          return
        }

        // Add as member
        const { error: joinError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: invite.organization_id,
            user_id: user.id,
            role: 'member',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (joinError) {
          console.error('Error joining organization:', joinError)
          toast({
            title: "Error",
            description: "Failed to join the organization: " + joinError.message,
            variant: "destructive"
          })
          return
        }

        // Delete the used invite
        await supabase
          .from('organization_invites')
          .delete()
          .eq('code', joinCode)

        // Update local state immediately
        const newOrg = {
          ...invite.organization,
          role: 'member'
        }
        setOrganizations(prev => [...prev, newOrg])

        // Close dialogs
        setIsJoinOrgDialogOpen(false)
        setShowOrgChoice(false)
        
        // Reset form
        setJoinCode("")

        toast({
          title: "Success",
          description: "Successfully joined the organization",
        })
      } catch (error: any) {
        console.error('Error in join process:', error)
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred while joining the organization",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('Error joining organization:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to join organization",
        variant: "destructive"
      })
    }
  }

  const handleGenerateInvite = async (organizationId: string) => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "Please select an organization first",
        variant: "destructive"
      })
      return
    }

    setGeneratingInvite(true)
    try {
      const code = await generateOrganizationInviteCode(organizationId)
      
      // Update the invites list
      await fetchOrganizationInvites(organizationId)
      
      // Show success message with code
      toast({
        title: "Invite Code Generated",
        description: `Code: ${code}`,
      })
    } catch (error: any) {
      console.error('Error generating invite code:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate invite code",
        variant: "destructive"
      })
    } finally {
      setGeneratingInvite(false)
    }
  }

  const fetchOrganizationInvites = async (organizationId: string) => {
    if (!organizationId) return
    
    try {
      const invitesList = await getOrganizationInvites(organizationId)
      setInvites(invitesList)
    } catch (error) {
      console.error('Error fetching invites:', error)
    }
  }

  const handleUpgradeOrganization = async () => {
    try {
      if (!selectedOrg) {
        toast({
          title: "Error",
          description: "Please select an organization first",
          variant: "destructive"
        })
        return
      }

      const { data, error: authError } = await supabase.auth.getSession()
      
      if (authError || !data?.session?.user?.id) {
        console.error('Auth error or no user found:', authError || 'No valid user')
        toast({
          title: "Authentication Error",
          description: "Please sign in again",
          variant: "destructive"
        })
        return
      }

      const user = data.session.user

      // Create update payload
      const updatePayload: any = {
        is_demo: false,
        trial_ends_at: null,
        updated_at: new Date().toISOString()
      }
      
      // Update name if provided
      if (upgradeOrgData.name) {
        updatePayload.name = upgradeOrgData.name
      }

      // Update the organization to remove demo status
      const { error: updateError } = await supabase
        .from('organizations')
        .update(updatePayload)
        .eq('id', selectedOrg)

      if (updateError) {
        console.error('Error updating organization:', updateError)
        toast({
          title: "Error",
          description: "Failed to upgrade organization",
          variant: "destructive"
        })
        return
      }

      // Refresh the organizations list
      await fetchUserOrganizations()
      
      // Close the dialog
      setIsUpgradeDialogOpen(false)
      
      // Reset the form
      setUpgradeOrgData({
        name: "",
        slug: ""
      })

      toast({
        title: "Success",
        description: "Organization upgraded successfully",
      })
    } catch (error: any) {
      console.error('Error upgrading organization:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to upgrade organization",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[300px]">Loading profile data...</div>
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="organization" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Organization
        </TabsTrigger>
        <TabsTrigger value="incident-types" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Incident Types
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="api" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          API
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userProfile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" className="w-32" asChild>
                    <label htmlFor="avatar-upload">
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                      />
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </label>
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 1MB.
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    placeholder="Sustainability Manager"
                    value={formData.job_title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex justify-end">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={saveProfileChanges}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="organization">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Your Organizations</CardTitle>
                  <CardDescription>Organizations you are a member of</CardDescription>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsJoinOrgDialogOpen(true)}>
                    Join Organization
                  </Button>
                  <Button onClick={() => setIsCreateOrgDialogOpen(true)}>
                    Create Organization
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {organizations.length > 0 ? (
                  <div className="divide-y">
                    {organizations.map((org) => (
                      <div key={org.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">
                              {org.name}
                              {org.is_demo && (
                                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800 border-blue-200">
                                  Demo
                                </Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {org.slug}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge>{org.role}</Badge>
                            {org.is_demo && (org.role === 'owner' || org.role === 'admin') && (
                              <Button
                                size="sm" 
                                variant="outline"
                                className="bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                                onClick={() => {
                                  setSelectedOrg(org.id)
                                  setUpgradeOrgData({
                                    name: org.name,
                                    slug: org.slug
                                  })
                                  setIsUpgradeDialogOpen(true)
                                }}
                              >
                                <Crown className="h-4 w-4 mr-2" />
                                Upgrade
                              </Button>
                            )}
                            {(org.role === 'owner' || org.role === 'admin') && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrg(org.id)
                                  fetchOrganizationInvites(org.id)
                                  handleGenerateInvite(org.id)
                                }}
                                disabled={generatingInvite}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Member
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Organizations Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Create or join an organization to start collaborating
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Display active invites if any */}
          {invites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Invite Codes</CardTitle>
                <CardDescription>Share these codes to invite team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invites.map(invite => (
                    <div key={invite.id} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-mono text-sm">{invite.code}</div>
                          <div className="text-xs text-gray-500">
                            Expires: {new Date(invite.expires_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            navigator.clipboard.writeText(invite.code)
                            toast({
                              title: "Copied!",
                              description: "Invite code copied to clipboard",
                            })
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy code</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Organization Choice Dialog */}
        <AlertDialog 
          open={showOrgChoice && organizations.length === 0} 
          onOpenChange={(open) => {
            // Only allow closing if user has an organization
            if (!open && organizations.length === 0) {
              toast({
                title: "Required",
                description: "You must create or join an organization to continue",
                variant: "destructive"
              })
              return
            }
            setShowOrgChoice(open)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Welcome to the Platform!</AlertDialogTitle>
              <AlertDialogDescription>
                To get started, you need to either create a new organization or join an existing one.
                This will allow you to manage your material library and collaborate with your team.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Button
                onClick={() => {
                  setIsCreateOrgDialogOpen(true)
                }}
                className="w-full"
              >
                Create New Organization
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsJoinOrgDialogOpen(true)
                }}
                className="w-full"
              >
                Join Existing Organization
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create Organization Dialog */}
        <AlertDialog 
          open={isCreateOrgDialogOpen} 
          onOpenChange={(open) => {
            if (!open && organizations.length === 0) {
              // Only show the choice dialog again if the user hasn't created an org
              setShowOrgChoice(true)
            }
            setIsCreateOrgDialogOpen(open)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Organization</AlertDialogTitle>
              <AlertDialogDescription>
                Create a new organization to collaborate with your team
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleCreateOrganization()
            }}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-org-name">Organization Name</Label>
                  <Input
                    id="new-org-name"
                    value={newOrgData.name}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Organization"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-org-slug">Organization Slug (Optional)</Label>
                  <Input
                    id="new-org-slug"
                    value={newOrgData.slug}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="my-organization"
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be used in URLs. If not provided, it will be generated from the organization name.
                  </p>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit">Create</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>

        {/* Join Organization Dialog */}
        <AlertDialog 
          open={isJoinOrgDialogOpen} 
          onOpenChange={(open) => {
            if (!open && organizations.length === 0) {
              // Only show the choice dialog again if the user hasn't joined an org
              setShowOrgChoice(true)
            }
            setIsJoinOrgDialogOpen(open)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Join Organization</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the invite code to join an organization
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleJoinOrganization()
            }}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="join-code">Invite Code</Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter invite code"
                    required
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit">Join</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>

        {/* Upgrade Demo Organization Dialog */}
        <AlertDialog 
          open={isUpgradeDialogOpen} 
          onOpenChange={setIsUpgradeDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Upgrade from Demo</AlertDialogTitle>
              <AlertDialogDescription>
                Upgrading your demo organization will remove the trial limitations and give you full access to all features, including unlimited AI file uploads.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpgradeOrganization()
            }}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={upgradeOrgData.name}
                    onChange={(e) => setUpgradeOrgData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Company Name Inc."
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You can update your organization name during the upgrade if you wish.
                  </p>
                </div>
                
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-semibold">Benefits of upgrading:</h4>
                  <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                    <li>Unlimited AI file uploads (currently limited to 14-day trial)</li>
                    <li>Remove the "Demo" label from your organization</li>
                    <li>All core features remain available</li>
                  </ul>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit">Upgrade Organization</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </TabsContent>

      <TabsContent value="incident-types">
        <IncidentTypesManager />
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-summary">Weekly Summary</Label>
                      <p className="text-sm text-gray-500">Receive a weekly summary of your carbon emissions</p>
                    </div>
                    <Switch 
                      id="email-summary" 
                      checked={notificationSettings.emailSummary} 
                      onCheckedChange={() => handleNotificationToggle('emailSummary')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-uploads">New Uploads</Label>
                      <p className="text-sm text-gray-500">Get notified when new files are uploaded and processed</p>
                    </div>
                    <Switch 
                      id="new-uploads" 
                      checked={notificationSettings.newUploads} 
                      onCheckedChange={() => handleNotificationToggle('newUploads')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="team-changes">Team Changes</Label>
                      <p className="text-sm text-gray-500">Get notified when team members are added or removed</p>
                    </div>
                    <Switch 
                      id="team-changes" 
                      checked={notificationSettings.teamChanges} 
                      onCheckedChange={() => handleNotificationToggle('teamChanges')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emission-alerts">Emission Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified when emissions exceed predefined thresholds</p>
                    </div>
                    <Switch 
                      id="emission-alerts" 
                      checked={notificationSettings.emissionAlerts} 
                      onCheckedChange={() => handleNotificationToggle('emissionAlerts')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="product-updates">Product Updates</Label>
                      <p className="text-sm text-gray-500">Receive updates about new features and improvements</p>
                    </div>
                    <Switch 
                      id="product-updates" 
                      checked={notificationSettings.productUpdates} 
                      onCheckedChange={() => handleNotificationToggle('productUpdates')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={saveNotificationSettings}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="api">
        <Card>
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
            <CardDescription>Manage your API keys and access to the Carbonly.ai API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">API Key</h3>

                <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-1 font-mono text-sm truncate">
                      {showApiKey ? apiKey : "•".repeat(apiKey.length)}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showApiKey ? "Hide API key" : "Show API key"}</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={copyApiKey}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy API key</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <AlertDialog open={isResetApiKeyDialogOpen} onOpenChange={setIsResetApiKeyDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset API Key
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will invalidate your current API key and generate a new one. Any applications
                          using the current key will stop working.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={resetApiKey} className="bg-red-600 hover:bg-red-700 text-white">
                          Reset Key
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">API Documentation</h3>
                <p className="text-sm text-gray-600">
                  Learn how to use the Carbonly.ai API to integrate carbon emission tracking into your applications.
                </p>
                <div className="flex space-x-4">
                  <Button variant="outline">View Documentation</Button>
                  <Button variant="outline">API Reference</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security and authentication options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Change Password</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>

                  <Button className="bg-green-600 hover:bg-green-700">Update Password</Button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="two-factor" />
                </div>

                <Button variant="outline" disabled>
                  Set Up Two-Factor Authentication
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Sessions</h3>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    You're currently signed in on this device. You can sign out of all other devices if you suspect
                    unauthorized access.
                  </p>

                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Sign Out of All Other Devices
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-sm font-medium text-red-600">Danger Zone</h3>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete your account and all associated data. This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}