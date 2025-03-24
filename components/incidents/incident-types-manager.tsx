"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus } from "lucide-react"
import { IncidentType } from "@/lib/types/incident"
import { incidentService } from "@/lib/services/incident-service"

export function IncidentTypesManager() {
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentType, setCurrentType] = useState<IncidentType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const loadIncidentTypes = async () => {
    setLoading(true)
    try {
      const data = await incidentService.getIncidentTypes()
      setIncidentTypes(data)
    } catch (error) {
      console.error("Failed to load incident types:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncidentTypes()
  }, [])

  const handleAddNew = () => {
    setFormData({ name: "", description: "" })
    setIsEditing(false)
    setCurrentType(null)
    setFormOpen(true)
  }

  const handleEdit = (type: IncidentType) => {
    setFormData({
      name: type.name,
      description: type.description || "",
    })
    setIsEditing(true)
    setCurrentType(type)
    setFormOpen(true)
  }

  const handleDelete = (type: IncidentType) => {
    setCurrentType(type)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentType) return
    
    try {
      await incidentService.deleteIncidentType(currentType.id)
      await loadIncidentTypes()
    } catch (error) {
      console.error("Failed to delete incident type:", error)
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (isEditing && currentType) {
        await incidentService.updateIncidentType(
          currentType.id,
          formData.name,
          formData.description
        )
      } else {
        await incidentService.createIncidentType(
          formData.name,
          formData.description
        )
      }
      await loadIncidentTypes()
      setFormOpen(false)
    } catch (error) {
      console.error("Failed to save incident type:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Incident Types</CardTitle>
            <CardDescription>
              Configure the types of environmental incidents your organization can report and track.
            </CardDescription>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Type
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">Loading incident types...</div>
        ) : incidentTypes.length === 0 ? (
          <div className="bg-muted/20 rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-4">No incident types configured yet</p>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Incident Type
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidentTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="truncate max-w-[400px]">
                      {type.description || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.active ? "default" : "outline"}>
                        {type.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(type)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Incident Type" : "Add New Incident Type"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Type Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Chemical Spill, Air Emissions, Waste Disposal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about this incident type"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
                {isEditing ? "Save Changes" : "Create Type"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Incident Type</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the "{currentType?.name}" incident type? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
} 