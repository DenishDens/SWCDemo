import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import MaterialLibrary from "@/components/dashboard/material-library"

export const metadata: Metadata = {
  title: "Material Library | Carbonly.ai",
  description: "Configure emission factors for different materials and activities",
}

export default function MaterialsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Material Library</h1>
        <MaterialLibrary />
      </div>
    </DashboardLayout>
  )
}

