import Link from 'next/link'
import { MapPin, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Incident, IncidentWithDetails } from '@/lib/types/incident'

interface IncidentCardProps {
  incident: Incident | IncidentWithDetails
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const statusColors = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-purple-100 text-purple-800',
  resolved: 'bg-gray-100 text-gray-800',
  closed: 'bg-gray-100 text-gray-800',
}

export function IncidentCard({ incident }: IncidentCardProps) {
  return (
    <Link href={`/incidents/${incident.id}`}>
      <Card className="hover:bg-gray-50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">
                {incident.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {incident.description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className={severityColors[incident.severity]}
              >
                {incident.severity}
              </Badge>
              <Badge
                variant="secondary"
                className={statusColors[incident.status]}
              >
                {incident.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>Reported {formatDate(incident.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {incident.assigned_to ? `Assigned to ${incident.assigned_to}` : 'Unassigned'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}