import { ProjectDashboardWrapper } from "@/components/dashboard/project-dashboard-wrapper"

// Remove typed params since they're causing issues
export default function ProjectDashboardPage(props: any) {
  // Just a basic placeholder for now
  return <div>Project ID: {props.params.id}</div>
}
