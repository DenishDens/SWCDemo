import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import FileUploader from "@/components/dashboard/file-uploader"

export const metadata: Metadata = {
  title: "Upload Files | Carbonly.ai",
  description: "Upload and analyze files for carbon emissions",
}

export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Upload Files</h1>
        <FileUploader />
      </div>
    </DashboardLayout>
  )
}

