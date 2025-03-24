import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { IncidentsManager } from "@/components/incidents/incidents-manager"

export const metadata: Metadata = {
  title: "Incidents | Carbonly.ai",
  description: "Manage and track environmental incidents",
}

export default function IncidentsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Incidents Management</h1>
          <p className="text-muted-foreground">
            Track, manage and report environmental incidents across your organization.
          </p>
        </div>
        
        <IncidentsManager />
      </div>
    </DashboardLayout>
  )
} 