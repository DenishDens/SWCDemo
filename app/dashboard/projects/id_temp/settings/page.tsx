import { Metadata } from "next"
import ProjectSettings from "@/components/dashboard/project-settings"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export const metadata: Metadata = {
  title: "Project Settings",
  description: "Manage your project settings and team members",
}

export default function ProjectSettingsPage(props: any) {
  // Just a basic placeholder for now
  return <div>Project Settings for: {props.params.id}</div>
}
