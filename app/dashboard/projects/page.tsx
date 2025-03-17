import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ProjectsManager from "@/components/dashboard/projects-manager"

export const metadata: Metadata = {
  title: "Projects | Carbonly.ai",
  description: "Manage your carbon emission tracking projects and business units",
}

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Projects & Business Units</h1>
        <ProjectsManager />
      </div>
    </DashboardLayout>
  )
}

