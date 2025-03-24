"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Incident, IncidentWithDetails } from "@/lib/types/incident"
import { format } from "date-fns"
import { Activity, MapPin, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { incidentService } from "@/lib/services/incident-service"

interface IncidentDetailsProps {
  incident: Incident | IncidentWithDetails
  onClose: () => void
  onUpdate: () => void
}

// Extended interface to include closed_at for local state
interface ExtendedIncident extends Incident {
  closed_at?: string;
}

export default function IncidentDetails({ incident, onClose, onUpdate }: IncidentDetailsProps) {
  const [loading, setLoading] = useState(false)
  const [currentIncident, setCurrentIncident] = useState<ExtendedIncident | IncidentWithDetails>(incident)

  useEffect(() => {
    setCurrentIncident(incident)
  }, [incident])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "open":
        return "Open"
      case "in_progress":
        return "In Progress"
      case "resolved":
        return "Resolved"
      case "closed":
        return "Closed"
      default:
        return status
    }
  }

  const handleCloseIncident = async () => {
    if (confirm("Are you sure you want to close this incident?")) {
      try {
        setLoading(true)
        await incidentService.closeIncident({
          incident_id: currentIncident.id,
          closure_note: "Incident closed by user"
        })
        
        // Update local state with typecasting to keep TypeScript happy
        setCurrentIncident({
          ...currentIncident,
          status: "closed",
          closed_at: new Date().toISOString(),
        } as ExtendedIncident | IncidentWithDetails)
        
        // Notify parent
        onUpdate()
      } catch (error) {
        console.error("Error closing incident:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleResolveIncident = async () => {
    if (confirm("Are you sure you want to resolve this incident?")) {
      try {
        setLoading(true)
        // Update the incident status to resolved
        await incidentService.updateIncident(currentIncident.id, {
          status: "resolved",
        })
        
        // Update local state
        setCurrentIncident({
          ...currentIncident,
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        
        // Notify parent
        onUpdate()
      } catch (error) {
        console.error("Error resolving incident:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const renderActionButtons = () => {
    switch (currentIncident.status) {
      case "open":
      case "in_progress":
        return (
          <>
            <Button variant="outline" onClick={handleResolveIncident} disabled={loading}>
              {loading ? "Processing..." : "Mark as Resolved"}
            </Button>
            <Button variant="outline" onClick={handleCloseIncident} disabled={loading}>
              {loading ? "Processing..." : "Close Incident"}
            </Button>
          </>
        )
      case "resolved":
        return (
          <Button variant="outline" onClick={handleCloseIncident} disabled={loading}>
            {loading ? "Processing..." : "Close Incident"}
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold mb-2">{currentIncident.title}</CardTitle>
            <CardDescription className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getSeverityColor(currentIncident.severity)}>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                {currentIncident.severity.charAt(0).toUpperCase() + currentIncident.severity.slice(1)} Severity
              </Badge>
              <Badge variant="outline" className={getStatusColor(currentIncident.status)}>
                {currentIncident.status === "resolved" || currentIncident.status === "closed" ? (
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Clock className="h-3.5 w-3.5 mr-1" />
                )}
                {formatStatus(currentIncident.status)}
              </Badge>
              {'incident_type_name' in currentIncident && currentIncident.incident_type_name && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  <Activity className="h-3.5 w-3.5 mr-1" />
                  {currentIncident.incident_type_name}
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-sm text-gray-900">{currentIncident.description || "No description provided."}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1 text-sm text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {currentIncident.location || "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Reported At</h3>
              <p className="mt-1 text-sm text-gray-900 flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                {currentIncident.reported_at ? format(new Date(currentIncident.reported_at), "PPP, p") : "Not specified"}
              </p>
            </div>
          </div>

          {currentIncident.resolved_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Resolved At</h3>
              <p className="mt-1 text-sm text-gray-900 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1 text-gray-400" />
                {format(new Date(currentIncident.resolved_at), "PPP, p")}
              </p>
            </div>
          )}

          {'closed_at' in currentIncident && currentIncident.closed_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Closed At</h3>
              <p className="mt-1 text-sm text-gray-900 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1 text-gray-400" />
                {format(new Date(currentIncident.closed_at as string), "PPP, p")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <Button variant="ghost" onClick={onClose}>
          Back
        </Button>
        <div className="flex gap-2">
          {renderActionButtons()}
        </div>
      </CardFooter>
    </Card>
  )
} 