"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { incidentService } from "@/lib/services/incident-service"
import { CreateIncidentParams, IncidentSeverity, IncidentType } from "@/lib/types/incident"

interface ReportIncidentFormProps {
  onSubmit: () => void
}

export default function ReportIncidentForm({ onSubmit }: ReportIncidentFormProps) {
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState<CreateIncidentParams>({
    project_id: "",
    title: "",
    description: "",
    severity: "medium" as IncidentSeverity,
    location: "",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // This would be a real API call in production
        // For demo purposes, we'll use mock data
        setProjects([
          { id: '00000000-0000-0000-0000-000000000021', name: 'Demo Project' },
          { id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', name: 'Headquarters' },
          { id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', name: 'R&D Center' }
        ])
        
        // Load incident types from API
        const incidentTypesData = await incidentService.getIncidentTypes()
        setIncidentTypes(incidentTypesData)
      } catch (error) {
        console.error("Error loading form data:", error)
      }
    }
    
    loadData()
  }, [])

  const handleChange = (field: keyof CreateIncidentParams, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.project_id || !formData.title || !formData.severity) {
      // Show validation errors
      return
    }
    
    try {
      setLoading(true)
      
      // Add the selected date to the form data
      const incidentData = {
        ...formData,
        reported_at: selectedDate ? selectedDate.toISOString() : undefined,
      }
      
      // Create the incident
      await incidentService.createIncident(incidentData)
      
      // Notify parent
      onSubmit()
    } catch (error) {
      console.error("Error creating incident:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="business-unit">Business Unit</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) => handleChange("project_id", value)}
            >
              <SelectTrigger id="business-unit">
                <SelectValue placeholder="Select business unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Business Units</SelectLabel>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief incident title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed incident description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incident-type">Type</Label>
              <Select
                value={formData.incident_type_id}
                onValueChange={(value) => handleChange("incident_type_id", value)}
              >
                <SelectTrigger id="incident-type">
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Incident Types</SelectLabel>
                    {incidentTypes.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No incident types available
                      </SelectItem>
                    ) : (
                      incidentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: IncidentSeverity) => handleChange("severity", value)}
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Severity</SelectLabel>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Incident location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date and Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP, p") : "Select date and time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Incident"}
        </Button>
      </div>
    </form>
  )
} 