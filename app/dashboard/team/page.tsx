import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import TeamManager from "@/components/dashboard/team-manager"

export const metadata: Metadata = {
  title: "Team Management | Carbonly.ai",
  description: "Manage your team members and their permissions",
}

export default function TeamPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Team Management</h1>
        <TeamManager />
      </div>
    </DashboardLayout>
  )
}

