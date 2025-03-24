"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, TrendingUp, Clock } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Incident } from "@/lib/types/incident"

interface AiPredictionsProps {
  incident: Incident
}

export default function AiPredictions({ incident }: AiPredictionsProps) {
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<any>(null)

  const generatePredictions = async () => {
    setLoading(true)
    
    try {
      // This would be a real API call in production
      // For demo purposes, we'll use mock data with a delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      setPredictions({
        similarIncidents: [
          {
            id: "inc-123",
            title: "Waste Water Spill in Sector 7",
            confidence: 87,
            timeAgo: "3 months ago",
          },
          {
            id: "inc-456",
            title: "Chemical Leak in Laboratory B",
            confidence: 72,
            timeAgo: "6 months ago",
          },
        ],
        estimatedResolution: {
          time: "4-6 days",
          confidence: 78,
        },
        riskFactors: [
          { name: "Environmental Impact", level: "High", score: 8 },
          { name: "Regulatory Risk", level: "Medium", score: 6 },
          { name: "Public Relations", level: "Medium", score: 5 },
        ],
        recommendations: [
          "Immediately implement containment procedures",
          "Notify local environmental agencies within 24 hours",
          "Schedule follow-up testing for affected areas",
        ],
      })
    } catch (error) {
      console.error("Error generating predictions:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!predictions && !loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-4">
              Generate AI predictions for this incident to get insights on similar past incidents,
              estimated resolution time, and recommended actions.
            </p>
            <Button onClick={generatePredictions}>Generate Predictions</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Similar Incidents</h3>
              <Skeleton className="h-20 w-full" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Resolution</h3>
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Assessment</h3>
              <Skeleton className="h-20 w-full" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations</h3>
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          AI Predictions
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 h-5 w-5">
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  These predictions are generated using AI and historical data. They are meant to
                  assist decision-making but should not replace expert judgment.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Similar Incidents</h3>
          <div className="space-y-2">
            {predictions.similarIncidents.map((similar: any) => (
              <div
                key={similar.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{similar.title}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {similar.timeAgo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded-full">
                    {similar.confidence}% match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Resolution</h3>
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium">{predictions.estimatedResolution.time}</p>
            <span className="text-xs font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded-full">
              {predictions.estimatedResolution.confidence}% confidence
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Assessment</h3>
          <div className="space-y-2">
            {predictions.riskFactors.map((risk: any, index: number) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-sm">{risk.name}</span>
                <div className="flex items-center">
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      risk.level === "Low"
                        ? "bg-green-100 text-green-800"
                        : risk.level === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {risk.level} ({risk.score}/10)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations</h3>
          <ul className="space-y-2">
            {predictions.recommendations.map((recommendation: string, index: number) => (
              <li key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full mr-2 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 