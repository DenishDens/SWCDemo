import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import SettingsManager from "@/components/dashboard/settings-manager"

export const metadata: Metadata = {
  title: "Settings | Carbonly.ai",
  description: "Manage your account and organization settings",
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <SettingsManager />
      </div>
    </DashboardLayout>
  )
}

