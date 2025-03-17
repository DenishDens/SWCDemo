import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import SubscriptionManager from "@/components/dashboard/subscription-manager"

export const metadata: Metadata = {
  title: "Subscription | Carbonly.ai",
  description: "Manage your Carbonly.ai subscription",
}

export default function SubscriptionPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
        <SubscriptionManager />
      </div>
    </DashboardLayout>
  )
}

