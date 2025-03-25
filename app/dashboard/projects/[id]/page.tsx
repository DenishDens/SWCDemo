import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ProjectDashboard from "@/components/dashboard/project-dashboard"

export const metadata: Metadata = {
  title: "Project Dashboard | Carbonly.ai",
  description: "View and manage your project's carbon emissions",
}

type Props = {
  params: { id: string }
}

export default function ProjectDashboardPage({ params }: Props) {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <ProjectDashboard projectId={params.id} />
      </div>
    </DashboardLayout>
  )
}

