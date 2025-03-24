"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Incident, IncidentSeverity, IncidentStatus, IncidentFilterParams } from "@/lib/types/incident"
import { incidentService } from "@/lib/services/incident-service"
import { PlusCircle, AlertTriangle } from "lucide-react"
import IncidentsFilter, { IncidentFilters } from "./incidents-filter"
import IncidentsList from "./incidents-list"
import IncidentDetails from "./incident-details"
import ReportIncidentForm from "./report-incident-form"
import AiPredictions from "./ai-predictions"

export function IncidentsManager() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [reportIncidentOpen, setReportIncidentOpen] = useState(false)
  const [aiPredictionsOpen, setAiPredictionsOpen] = useState(false)
  const [filters, setFilters] = useState<IncidentFilters>({
    search: "",
    status: ["open", "in_progress"],
    severity: [],
    incident_type_id: null,
    date_range: "all",
  })

  // Convert UI filter format to API filter format
  const mapFiltersToParams = (uiFilters: IncidentFilters): IncidentFilterParams => {
    const result: IncidentFilterParams = {}
    
    // Add search term
    if (uiFilters.search) {
      result.search = uiFilters.search
    }
    
    // Add status if only one is selected
    if (uiFilters.status.length === 1) {
      result.status = uiFilters.status[0] as IncidentStatus
    }
    
    // Add severity if only one is selected
    if (uiFilters.severity.length === 1) {
      result.severity = uiFilters.severity[0] as IncidentSeverity
    }
    
    // Add incident type
    if (uiFilters.incident_type_id) {
      result.incident_type_id = uiFilters.incident_type_id
    }
    
    // Map date range to from/to dates
    if (uiFilters.date_range !== 'all') {
      const now = new Date()
      let fromDate = new Date()
      
      switch(uiFilters.date_range) {
        case 'today':
          fromDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          fromDate.setDate(now.getDate() - 7)
          break
        case 'month':
          fromDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          fromDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      result.from_date = fromDate.toISOString()
    }
    
    return result
  }

  const loadIncidents = async () => {
    setLoading(true)
    try {
      // Convert filters to the format expected by the API
      const filterParams = mapFiltersToParams(filters)
      const data = await incidentService.getIncidents(filterParams)
      setIncidents(data)
    } catch (error) {
      console.error("Failed to load incidents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncidents()
  }, [filters])

  const handleFilterChange = (newFilters: IncidentFilters) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: ["open", "in_progress"],
      severity: [],
      incident_type_id: null,
      date_range: "all",
    })
  }

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident)
  }

  const handleCloseIncidentDetails = () => {
    setSelectedIncident(null)
  }

  const handleIncidentCreated = () => {
    setReportIncidentOpen(false)
    loadIncidents()
  }

  const handleIncidentUpdated = () => {
    loadIncidents()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Environmental Incidents</h2>
        <Dialog open={reportIncidentOpen} onOpenChange={setReportIncidentOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogTitle>Report Environmental Incident</DialogTitle>
            <ReportIncidentForm onSubmit={handleIncidentCreated} />
          </DialogContent>
        </Dialog>
      </div>

      <IncidentsFilter 
        filters={filters} 
        onChange={handleFilterChange} 
        onReset={handleResetFilters} 
      />

      {selectedIncident ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <IncidentDetails 
              incident={selectedIncident} 
              onClose={handleCloseIncidentDetails} 
              onUpdate={handleIncidentUpdated}
            />
          </div>
          <div>
            <AiPredictions incident={selectedIncident} />
          </div>
        </div>
      ) : (
        <IncidentsList 
          incidents={incidents} 
          loading={loading} 
          onSelectIncident={handleSelectIncident}
        />
      )}
    </div>
  )
} 