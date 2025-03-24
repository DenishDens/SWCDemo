"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  FileUp,
  FileText,
  Share2,
  Settings,
  Users,
  ChevronUp,
  ChevronDown,
  Building,
  ArrowRight,
} from "lucide-react"

interface ProjectDashboardProps {
  projectId: string
  organizationId: string
  userRole: 'owner' | 'admin' | 'member'
}

interface Project {
  id: string
  name: string
  description: string
  type: 'business_unit' | 'project'
  organization_id: string
  code: string
  status: 'active' | 'inactive' | 'draft'
  location?: string
  parent_id?: string
  parent?: {
    id: string
    name: string
    type: 'business_unit' | 'project'
    code: string
  }
  emissions_data?: {
    total: number
    change: number
    scope1: number
    scope1Change: number
    scope2: number
    scope2Change: number
    scope3: number
    scope3Change: number
  }
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  childProjects?: Project[]
}

interface Upload {
  id: string
  name: string
  size: number
  status: 'processing' | 'completed' | 'failed'
  created_at: string
}

interface Member {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member'
  avatar_url?: string
}

interface EmissionMetricCardProps {
  title: string
  value: string
  change: number
  description: string
}

interface ProjectMemberWithUser {
  id: string
  role: 'owner' | 'admin' | 'member'
  user: {
    id: string
    email: string
    raw_user_meta_data: {
      full_name?: string | null
      avatar_url?: string | null
    } | null
  }
}

interface DatabaseProjectMember {
  id: string
  role: 'owner' | 'admin' | 'member'
  user: {
    id: string
    email: string
    raw_user_meta_data: Record<string, any> | null
  }
}

interface SupabaseProjectMember {
  id: string
  role: 'owner' | 'admin' | 'member'
  project_id: string
  user: {
    id: string
    email: string
    raw_user_meta_data: Record<string, any> | null
  }
}

export default function ProjectDashboard({ 
  projectId, 
  organizationId, 
  userRole 
}: ProjectDashboardProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploads, setUploads] = useState<Upload[]>([])
  const [members, setMembers] = useState<Member[]>([])

  // Organization-specific logic and role-based access control
  const canEdit = userRole === 'owner' || userRole === 'admin'
  const canView = true // All roles can view

  useEffect(() => {
    async function loadProject() {
      try {
        const supabase = createClientComponentClient()

        // Get the project with its parent (if it's a child project)
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            parent:projects!projects_parent_id_fkey(
              id,
              name,
              type,
              code
            )
          `)
          .eq('id', projectId)
          .single()

        if (projectError) throw projectError

        // If it's a business unit, get its child projects
        if (projectData.type === 'business_unit') {
          const { data: childProjects, error: childError } = await supabase
            .from('projects')
            .select('*')
            .eq('parent_id', projectId)
            .eq('type', 'project')

          if (childError) throw childError
          projectData.childProjects = childProjects
        }

        // Get project members with their user data
        const { data: memberData, error: memberError } = await supabase
          .from('project_members')
          .select(`
            id,
            role,
            project_id,
            user:users (
              id,
              email,
              raw_user_meta_data
            )
          `)
          .eq('project_id', projectId)
          .returns<SupabaseProjectMember[]>()

        if (memberError) throw memberError

        // Get recent uploads
        const { data: uploadData, error: uploadError } = await supabase
          .from('uploads')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(5)

        if (uploadError) throw uploadError

        setProject(projectData)
        setMembers(memberData?.map(m => ({
          id: m.user.id,
          name: m.user.raw_user_meta_data?.full_name || m.user.email,
          email: m.user.email,
          role: m.role,
          avatar_url: m.user.raw_user_meta_data?.avatar_url || null
        })) || [])
        setUploads(uploadData || [])
      } catch (error) {
        console.error('Error loading project:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  if (loading || !project) {
    return <div>Loading...</div>
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {project.type === 'project' && project.parent && (
              <div className="flex items-center text-sm text-gray-500">
                <Button variant="ghost" size="sm" className="flex items-center" asChild>
                  <a href={`/dashboard/projects/${project.parent.id}`}>
                    <Building className="h-4 w-4 mr-1" />
                    {project.parent.name}
                  </a>
                </Button>
                <ArrowRight className="h-4 w-4 mx-1" />
              </div>
            )}
            <Badge variant={project.type === 'business_unit' ? 'secondary' : 'default'}>
              {project.type === 'business_unit' ? 'Business Unit' : 'Project'}
            </Badge>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button variant="outline" className="flex items-center">
              <FileUp className="h-4 w-4 mr-2" />
              Upload Data
            </Button>
          )}
          <Button variant="outline" className="flex items-center">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {canEdit && (
            <Button variant="outline" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      </div>

      {project.type === 'business_unit' && project.childProjects && project.childProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Child Projects</CardTitle>
            <CardDescription>Projects under this business unit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.childProjects.map((childProject) => (
                <div key={childProject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{childProject.name}</h3>
                    <p className="text-sm text-gray-500">{childProject.description}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/dashboard/projects/${childProject.id}`}>
                      View Project
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <EmissionMetricCard
          title="Total Emissions"
          value={`${project.emissions_data?.total.toFixed(2) ?? '0'} tCO₂e`}
          change={project.emissions_data?.change ?? 0}
          description="Last 30 days"
        />
        <EmissionMetricCard
          title="Scope 1"
          value={`${project.emissions_data?.scope1.toFixed(2) ?? '0'} tCO₂e`}
          change={project.emissions_data?.scope1Change ?? 0}
          description="Direct emissions"
        />
        <EmissionMetricCard
          title="Scope 2"
          value={`${project.emissions_data?.scope2.toFixed(2) ?? '0'} tCO₂e`}
          change={project.emissions_data?.scope2Change ?? 0}
          description="Indirect emissions"
        />
        <EmissionMetricCard
          title="Scope 3"
          value={`${project.emissions_data?.scope3.toFixed(2) ?? '0'} tCO₂e`}
          change={project.emissions_data?.scope3Change ?? 0}
          description="Value chain emissions"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>Latest data files uploaded to this {project.type.toLowerCase()}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {uploads.length === 0 ? (
              <div className="text-center py-8">
                <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No uploads yet</h3>
                <p className="text-gray-500 mb-4">
                  Upload files to start tracking emissions for this {project.type.toLowerCase()}
                </p>
                {canEdit && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload Data
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{upload.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatBytes(upload.size)} • {formatDate(upload.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        upload.status === 'completed' ? 'default' : 
                        upload.status === 'processing' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {upload.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>People with access to this {project.type.toLowerCase()}</CardDescription>
            </div>
            {canEdit && (
              <Button className="bg-green-600 hover:bg-green-700">
                <Users className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  {canEdit && (
                    <Button variant="outline" size="sm">
                      Manage Access
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmissionMetricCard({ title, value, change, description }: EmissionMetricCardProps) {
  const isPositive = change >= 0

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`flex items-center ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
          <span className="text-xs font-medium">{Math.abs(change)}%</span>
          {isPositive ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </div>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold">{value}</span>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  )
}
