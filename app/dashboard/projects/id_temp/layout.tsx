import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default function ProjectDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </DashboardLayout>
  )
}
