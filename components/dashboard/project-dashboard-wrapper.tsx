"use client"

import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ProjectDashboard from "@/components/dashboard/project-dashboard"

interface ProjectDashboardWrapperProps {
  projectId: string
  organizationId: string
  userRole: 'owner' | 'admin' | 'member'
}

export function ProjectDashboardWrapper({ 
  projectId, 
  organizationId, 
  userRole 
}: ProjectDashboardWrapperProps) {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <ProjectDashboard 
          projectId={projectId} 
          organizationId={organizationId}
          userRole={userRole}
        />
      </div>
    </DashboardLayout>
  )
}
