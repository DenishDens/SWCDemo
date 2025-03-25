"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  BarChart3,
  FileUp,
  Settings,
  Users,
  Database,
  CreditCard,
  LogOut,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { getCurrentUserOrganizations, OrganizationWithRole } from "@/lib/services/organization-service"
import AIAssistant from "@/components/dashboard/ai-assistant"
import { useToast } from "@/hooks/use-toast"
import Sidebar from "@/components/dashboard/sidebar"
import Header from "@/components/dashboard/header"
import TestAuth from "@/components/test-auth"

interface DashboardLayoutProps {
  children: React.ReactNode
}

type UserProfile = {
  id?: string
  full_name: string
  email: string
  job_title?: string
  phone?: string
  org_name?: string
  org_industry?: string
  org_size?: string
  org_address?: string
  org_website?: string
  notification_settings?: {
    emailSummary: boolean
    newUploads: boolean
    teamChanges: boolean
    emissionAlerts: boolean
    productUpdates: boolean
  }
}

async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Error getting session:', sessionError)
      return null
    }
    
    if (!session?.session?.user) {
      console.log('No active session found')
      return null
    }
    
    const user = session.session.user
    
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      if (profileError.code === 'PGRST116') { // No profile found, create default
        console.log('No profile found, returning default profile data')
        return {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
          email: user.email || "",
          notification_settings: {
            emailSummary: true,
            newUploads: true,
            teamChanges: true,
            emissionAlerts: true,
            productUpdates: false,
          }
        }
      }
      
      console.error('Error fetching profile:', profileError)
      throw profileError
    }
    
    return {
      ...profile,
      email: user.email || ""
    }
  } catch (error) {
    console.error('Error in fetchUserProfile:', error)
    throw error
  }
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationWithRole | null>(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithRole | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const params = useParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true)
      // Remove welcome parameter after reading it
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('welcome')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  // Fetch user profile and organizations
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUser(true)
        const userData = await fetchUserProfile()
        if (userData) {
          console.log("Fetched user profile:", userData)
          setUserProfile(userData)
        } else {
          console.log("No user profile found, will need to create one")
          // We'll handle this gracefully - the settings page will prompt them to create a profile
          setUserProfile({
            full_name: "New User",
            email: "",
            job_title: "",
            notification_settings: {
              emailSummary: true,
              newUploads: true,
              teamChanges: true,
              emissionAlerts: true,
              productUpdates: false,
            }
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        // Set default user data for graceful degradation
        setUserProfile({
          full_name: "New User",
          email: "",
          job_title: "",
          notification_settings: {
            emailSummary: true,
            newUploads: true,
            teamChanges: true,
            emissionAlerts: true,
            productUpdates: false,
          }
        })
      } finally {
        setLoadingUser(false)
      }
    }

    const fetchUserOrganizations = async () => {
      try {
        setLoadingOrgs(true)
        const orgs = await getCurrentUserOrganizations().catch(error => {
          console.error("Error in getCurrentUserOrganizations:", error)
          return []
        })
        
        console.log("Fetched organizations:", orgs)
        setOrganizations(orgs || [])
        
        if (orgs && orgs.length > 0) {
          const firstOrg = orgs[0]
          setSelectedOrganization(firstOrg)
          localStorage.setItem('selectedOrganizationId', firstOrg.id)
          
          // Check if this is a demo organization with a trial
          if (firstOrg.is_demo && firstOrg.trial_ends_at) {
            try {
              const trialEndDate = new Date(firstOrg.trial_ends_at);
              const today = new Date();
              const timeDiff = trialEndDate.getTime() - today.getTime();
              const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
              
              if (daysDiff > 0) {
                setDaysRemaining(daysDiff);
              }
            } catch (e) {
              console.error("Error calculating trial days:", e);
            }
          }
        } else {
          console.log("User has no organizations, will need to create or join one")
          setSelectedOrganization(null)
          localStorage.removeItem('selectedOrganizationId')
        }
      } catch (error) {
        console.error("Error fetching organizations:", error)
        setOrganizations([])
        setSelectedOrganization(null)
        localStorage.removeItem('selectedOrganizationId')
      } finally {
        setLoadingOrgs(false)
      }
    }

    fetchUserData()
    fetchUserOrganizations()
  }, [])

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Check if sidebar collapsed state is stored in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedState = localStorage.getItem("sidebarCollapsed")
      if (storedState) {
        setSidebarCollapsed(storedState === "true")
      }
    }
  }, [])

  const handleOrganizationChange = (org: OrganizationWithRole) => {
    setSelectedOrganization(org)
    localStorage.setItem('selectedOrganizationId', org.id)
    // Refresh the current page to update data for new organization
    router.refresh()
  }

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", String(newState))
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account"
      })
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          user={userProfile} 
          avatar={userProfile?.full_name?.[0] || "U"}
          onLogout={handleSignOut}
          organizations={organizations}
          selectedOrganization={selectedOrganization}
          onOrganizationChange={handleOrganizationChange}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {/* Auth debug component - remove in production */}
          <div className="mb-4">
            <TestAuth />
          </div>
          
          {organizations.length === 0 && pathname !== '/dashboard/settings' ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 mb-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Welcome to the platform!</h3>
                  <p className="text-sm text-yellow-700">
                    To get started, you need to set up your organization. Please{" "}
                    <Link href="/dashboard/settings" className="font-medium underline">
                      visit the settings page
                    </Link>{" "}
                    to create your organization and complete your profile.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          
          {daysRemaining !== null && daysRemaining > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4">
              <div className="flex items-center space-x-3">
                <FileUp className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Demo Organization</h3>
                  <p className="text-sm text-blue-700">
                    Your AI file upload trial expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. 
                    After this period, you can upgrade to continue using AI file uploads.
                    All other features will remain available.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {!selectedOrganization && showWelcome && (
            <div className="flex flex-col justify-center items-center p-8 text-center max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold mb-4">Welcome to the platform!</h1>
              <p className="text-gray-500 mb-6">Your account has been created successfully and we've set up a starter organization for you. Take a moment to explore the dashboard and get familiar with the features.</p>
              <Button onClick={() => router.push('/dashboard/settings?tab=organization')} className="mb-2">
                Complete Your Organization Setup
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard/settings?tab=profile')}>
                Complete Your Profile
              </Button>
            </div>
          )}
          
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  )
}
