"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { incidentService } from "@/lib/services/incident-service"
import { IncidentType } from "@/lib/types/incident"
import { Search, X } from "lucide-react"

export interface IncidentFilters {
  search: string
  status: string[]
  severity: string[]
  incident_type_id: string | null
  date_range: "all" | "today" | "week" | "month" | "year"
}

interface IncidentsFilterProps {
  filters: IncidentFilters
  onChange: (filters: IncidentFilters) => void
  onReset: () => void
}

export default function IncidentsFilter({ 
  filters, 
  onChange, 
  onReset 
}: IncidentsFilterProps) {
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([])
  const [localFilters, setLocalFilters] = useState<IncidentFilters>(filters)
  
  useEffect(() => {
    const fetchIncidentTypes = async () => {
      try {
        const types = await incidentService.getIncidentTypes()
        setIncidentTypes(types)
      } catch (error) {
        console.error("Error fetching incident types:", error)
      }
    }
    
    fetchIncidentTypes()
  }, [])
  
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])
  
  const handleInputChange = (key: keyof IncidentFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onChange(localFilters)
  }
  
  const handleStatusToggle = (status: string) => {
    let newStatuses: string[]
    
    if (localFilters.status.includes(status)) {
      newStatuses = localFilters.status.filter(s => s !== status)
    } else {
      newStatuses = [...localFilters.status, status]
    }
    
    const newFilters = { ...localFilters, status: newStatuses }
    setLocalFilters(newFilters)
    onChange(newFilters)
  }
  
  const handleSeverityToggle = (severity: string) => {
    let newSeverities: string[]
    
    if (localFilters.severity.includes(severity)) {
      newSeverities = localFilters.severity.filter(s => s !== severity)
    } else {
      newSeverities = [...localFilters.severity, severity]
    }
    
    const newFilters = { ...localFilters, severity: newSeverities }
    setLocalFilters(newFilters)
    onChange(newFilters)
  }
  
  const handleDateRangeChange = (value: string) => {
    const newFilters = { 
      ...localFilters, 
      date_range: value as "all" | "today" | "week" | "month" | "year"
    }
    setLocalFilters(newFilters)
    onChange(newFilters)
  }
  
  const handleTypeChange = (value: string) => {
    const newFilters = {
      ...localFilters,
      incident_type_id: value === "all" ? null : value
    }
    setLocalFilters(newFilters)
    onChange(newFilters)
  }
  
  const handleResetFilters = () => {
    onReset()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search incidents..."
            className="pl-8"
            value={localFilters.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
        <Button type="button" variant="outline" onClick={handleResetFilters}>
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </form>

      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <div className="flex flex-wrap gap-2" id="status-filter">
            <Button
              variant={localFilters.status.includes("open") ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusToggle("open")}
            >
              Open
            </Button>
            <Button
              variant={localFilters.status.includes("in_progress") ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusToggle("in_progress")}
            >
              In Progress
            </Button>
            <Button
              variant={localFilters.status.includes("resolved") ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusToggle("resolved")}
            >
              Resolved
            </Button>
            <Button
              variant={localFilters.status.includes("closed") ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusToggle("closed")}
            >
              Closed
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity-filter">Severity</Label>
          <div className="flex flex-wrap gap-2" id="severity-filter">
            <Button
              variant={localFilters.severity.includes("low") ? "default" : "outline"}
              size="sm"
              onClick={() => handleSeverityToggle("low")}
            >
              Low
            </Button>
            <Button
              variant={localFilters.severity.includes("medium") ? "default" : "outline"}
              size="sm"
              onClick={() => handleSeverityToggle("medium")}
            >
              Medium
            </Button>
            <Button
              variant={localFilters.severity.includes("high") ? "default" : "outline"}
              size="sm"
              onClick={() => handleSeverityToggle("high")}
            >
              High
            </Button>
            <Button
              variant={localFilters.severity.includes("critical") ? "default" : "outline"}
              size="sm"
              onClick={() => handleSeverityToggle("critical")}
            >
              Critical
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-filter">Date Range</Label>
          <Select 
            value={localFilters.date_range} 
            onValueChange={handleDateRangeChange}
          >
            <SelectTrigger id="date-filter">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type-filter">Incident Type</Label>
          <Select 
            value={localFilters.incident_type_id || "all"} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="Select incident type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Types</SelectItem>
                {incidentTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
} 