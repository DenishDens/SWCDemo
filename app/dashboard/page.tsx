import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import EmissionsOverview from "@/components/dashboard/emissions-overview"
import RecentUploads from "@/components/dashboard/recent-uploads"
import ProjectsList from "@/components/dashboard/projects-list"
import TeamMembers from "@/components/dashboard/team-members"

export const metadata: Metadata = {
  title: "Dashboard | Carbonly.ai",
  description: "Monitor and manage your organization's carbon emissions",
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <EmissionsOverview />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentUploads />
          <ProjectsList />
        </div>
        <TeamMembers />
      </div>
    </DashboardLayout>
  )
}

