"use client"

import { useState, useEffect } from "react"
import { Incident } from "@/lib/types/incident"
import IncidentCard from "./incident-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface IncidentsListProps {
  incidents: Incident[]
  loading: boolean
  onSelectIncident: (incident: Incident) => void
}

export default function IncidentsList({
  incidents,
  loading,
  onSelectIncident,
}: IncidentsListProps) {
  const [page, setPage] = useState(1)
  const pageSize = 6
  const totalPages = Math.ceil(incidents.length / pageSize)

  const paginatedIncidents = incidents.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [incidents])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No incidents found</h3>
        <p className="text-sm text-gray-500 mb-4">
          No incidents match your current filters or search criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedIncidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            onClick={onSelectIncident}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, incidents.length)} of {incidents.length} incidents
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 