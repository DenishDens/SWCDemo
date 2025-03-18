
import { LoadingSpinner } from "./loading-spinner"

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  )
}
