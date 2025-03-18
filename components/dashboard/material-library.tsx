"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from "@/lib/material-library"

export default function MaterialLibrary() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeScope, setActiveScope] = useState("scope1")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
  const [addDialogScope, setAddDialogScope] = useState("")
  const [materials, setMaterials] = useState<Record<string, any[]>>({
    scope1: [],
    scope2: [],
    scope3: [],
    downstream: []
  })

  const categoryDescriptions = {
    "Stationary Combustion": "Emissions from fuel combustion in owned assets (e.g., boilers, furnaces, generators)",
    "Mobile Combustion": "Emissions from vehicles and machinery (e.g., company-owned trucks, ships, aircraft)",
    "Process Emissions": "Emissions from chemical processes (e.g., cement production, steel manufacturing)",
    "Fugitive Emissions": "Leaks from equipment (e.g., refrigerants, methane leaks from pipelines)",
    "Purchased Electricity": "Emissions from power used in operations (factories, offices, data centers)",
    "Purchased Steam": "Energy sourced externally for heating or industrial processes",
    "Purchased Heating": "External district heating networks or third-party heat suppliers",
    "Purchased Cooling": "External district cooling networks or HVAC system emissions",
    "Purchased Goods & Services": "Raw materials, office supplies, manufacturing inputs",
    "Capital Goods": "Emissions from production of long-term assets (machinery, vehicles, buildings)",
    "Business Travel": "Emissions from business-related travel",
    "Employee Commuting": "Emissions from employees commuting to work",
    "Transportation and Distribution (Downstream)": "Emissions from the transportation and distribution of products sold by the company",
    "Processing of Sold Products": "Emissions from the processing of products sold by the company",
    "Use of Sold Products": "Emissions from the use of products sold by the company",
    "End-of-Life Treatment of Sold Products": "Emissions from the end-of-life treatment of products sold by the company"
  }

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getMaterials('your-org-id') // Replace with actual org ID
        const grouped = data.reduce((acc, material) => {
          const scope = material.scope.toLowerCase()
          if (!acc[scope]) acc[scope] = []
          acc[scope].push(material)
          return acc
        }, {} as Record<string, any[]>)
        setMaterials(grouped)
      } catch (error) {
        console.error('Error fetching materials:', error)
      }
    }
    fetchMaterials()
  }, [])

  const handleAddMaterial = async (formData: any) => {
    try {
      const newMaterial = await createMaterial({
        ...formData,
        organization_id: 'your-org-id' // Replace with actual org ID
      })
      setMaterials(prev => {
        const scope = newMaterial.scope.toLowerCase()
        return {
          ...prev,
          [scope]: [...(prev[scope] || []), newMaterial]
        }
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding material:', error)
    }
  }

  const handleUpdateMaterial = async (id: string, formData: any) => {
    try {
      const updatedMaterial = await updateMaterial(id, formData)
      setMaterials(prev => {
        const scope = updatedMaterial.scope.toLowerCase()
        return {
          ...prev,
          [scope]: prev[scope].map(m => m.id === id ? updatedMaterial : m)
        }
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating material:', error)
    }
  }

  const handleDeleteMaterial = async (id: string, scope: string) => {
    try {
      await deleteMaterial(id)
      setMaterials(prev => ({
        ...prev,
        [scope]: prev[scope].filter(m => m.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting material:', error)
    }
  }

  const handleEditMaterial = (material: any) => {
    setSelectedMaterial(material)
    setIsEditDialogOpen(true)
  }

  const handleSaveMaterial = () => {
    setIsEditDialogOpen(false)
    // In a real app, this would save the updated material data
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Emission Factors Library</CardTitle>
            <CardDescription>Configure emission factors for different materials and activities</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Material</DialogTitle>
                <DialogDescription>Add a new material or activity with its emission factor</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" placeholder="Material name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="scope" className="text-right">
                    Scope
                  </Label>
                  <Select onValueChange={(value) => setAddDialogScope(value)}>
                    <SelectTrigger id="scope" className="col-span-3">
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scope1">Scope 1</SelectItem>
                      <SelectItem value="scope2">Scope 2</SelectItem>
                      <SelectItem value="scope3">Scope 3</SelectItem>
                      <SelectItem value="downstream">Downstream Emissions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <div className="space-y-2 col-span-3">
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {addDialogScope && scopeCategories[addDialogScope as keyof typeof scopeCategories].map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Display description here */}
                    {/*<p className="text-sm text-muted-foreground">Description will go here</p>*/}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">
                    Unit
                  </Label>
                  <Input id="unit" placeholder="Unit of measurement" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="factor" className="text-right">
                    Emission Factor
                  </Label>
                  <Input id="factor" type="number" step="0.01" placeholder="0.00" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="source" className="text-right">
                    Source
                  </Label>
                  <Input id="source" placeholder="Data source" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAddMaterial({name: "", scope: addDialogScope, category: "", unit: "", factor: 0, source: ""})}>
                  Add Material
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs value={activeScope} onValueChange={setActiveScope}>
            <TabsList className="mb-6">
              <TabsTrigger value="scope1">Scope 1</TabsTrigger>
              <TabsTrigger value="scope2">Scope 2</TabsTrigger>
              <TabsTrigger value="scope3">Scope 3</TabsTrigger>
              <TabsTrigger value="downstream">Downstream Emissions</TabsTrigger>
            </TabsList>

            {(["scope1", "scope2", "scope3", "downstream"] as const).map((scope) => (
              <TabsContent key={scope} value={scope}>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Emission Factor (kgCO₂e)</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials[scope]?.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{material.name}</TableCell>
                          <TableCell>{material.category}</TableCell>
                          <TableCell>{material.unit}</TableCell>
                          <TableCell className="text-right">{material.factor.toFixed(2)}</TableCell>
                          <TableCell>{material.source}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditMaterial(material)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteMaterial(material.id, scope)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>Update emission factor details for this material</DialogDescription>
          </DialogHeader>
          {selectedMaterial && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input id="edit-name" defaultValue={selectedMaterial.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <div className="space-y-2 col-span-3">
                  <Select defaultValue={selectedMaterial.category}>
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeCategories[activeScope as keyof typeof scopeCategories].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">{categoryDescriptions[selectedMaterial.category]}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-unit" className="text-right">
                  Unit
                </Label>
                <Input id="edit-unit" defaultValue={selectedMaterial.unit} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-factor" className="text-right">
                  Emission Factor
                </Label>
                <Input
                  id="edit-factor"
                  type="number"
                  step="0.01"
                  defaultValue={selectedMaterial.factor}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-source" className="text-right">
                  Source
                </Label>
                <Input id="edit-source" defaultValue={selectedMaterial.source} className="col-span-3" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateMaterial(selectedMaterial.id, {name: "", scope: "", category: "", unit: "", factor: 0, source: ""})}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const scopeCategories = {
    scope1: ["Stationary Combustion", "Mobile Combustion", "Process Emissions", "Fugitive Emissions"],
    scope2: ["Purchased Electricity", "Purchased Steam", "Purchased Heating", "Purchased Cooling"],
    scope3: [
      "Purchased Goods & Services",
      "Capital Goods",
      "Business Travel",
      "Employee Commuting",
      "Transportation and Distribution (Downstream)",
      "Processing of Sold Products",
      "Use of Sold Products",
      "End-of-Life Treatment of Sold Products"
    ],
    downstream: []
  }