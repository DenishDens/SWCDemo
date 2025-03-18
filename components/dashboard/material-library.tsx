"use client"

import { useState } from "react"
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

export default function MaterialLibrary() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeScope, setActiveScope] = useState("scope1")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
  const [addDialogScope, setAddDialogScope] = useState("")
  
  const scopeCategories = {
    scope1: [
      "Stationary Combustion",
      "Mobile Combustion", 
      "Process Emissions",
      "Fugitive Emissions"
    ],
    scope2: [
      "Purchased Electricity",
      "Purchased Steam",
      "Purchased Heating",
      "Purchased Cooling"
    ],
    scope3: [
      "Purchased Goods & Services",
      "Capital Goods",
      "Fuel- and Energy-Related Activities",
      "Upstream Transportation & Distribution",
      "Waste Generated in Operations",
      "Business Travel",
      "Employee Commuting",
      "Upstream Leased Assets"
    ],
    downstream: [
      "Downstream Transportation & Distribution",
      "Processing of Sold Products",
      "Use of Sold Products",
      "End-of-Life Treatment of Sold Products",
      "Downstream Leased Assets",
      "Franchises",
      "Investments"
    ]
  }

  // Define categories for each scope based on GHG Protocol
  const scopeCategories = {
    scope1: ["Stationary Combustion", "Mobile Combustion", "Process Emissions", "Fugitive Emissions"],
    scope2: ["Purchased Electricity", "Purchased Heat", "Purchased Steam", "Purchased Cooling"],
    scope3: [
      "Purchased Goods and Services",
      "Capital Goods",
      "Fuel and Energy-Related Activities",
      "Transportation and Distribution (Upstream)",
      "Waste Generated in Operations",
      "Business Travel",
      "Employee Commuting",
      "Leased Assets (Upstream)",
      "Transportation and Distribution (Downstream)",
      "Processing of Sold Products",
      "Use of Sold Products",
      "End-of-Life Treatment of Sold Products",
      "Leased Assets (Downstream)",
      "Franchises",
      "Investments",
    ],
  }

  // Mock data - in a real app, this would come from your API
  const materials = {
    downstream: [],
    scope1: [
      {
        id: 1,
        name: "Natural Gas",
        category: "Stationary Combustion",
        unit: "m³",
        factor: 2.02,
        source: "GHG Protocol",
      },
      { id: 2, name: "Diesel", category: "Mobile Combustion", unit: "L", factor: 2.68, source: "EPA" },
      { id: 3, name: "Gasoline", category: "Mobile Combustion", unit: "L", factor: 2.31, source: "EPA" },
      { id: 4, name: "Propane", category: "Stationary Combustion", unit: "L", factor: 1.51, source: "GHG Protocol" },
    ],
    scope2: [
      {
        id: 5,
        name: "Electricity (Grid Average)",
        category: "Purchased Electricity",
        unit: "kWh",
        factor: 0.42,
        source: "EPA eGRID",
      },
      {
        id: 6,
        name: "Electricity (Renewable)",
        category: "Purchased Electricity",
        unit: "kWh",
        factor: 0.0,
        source: "GHG Protocol",
      },
      { id: 7, name: "Steam", category: "Purchased Heat", unit: "kg", factor: 0.27, source: "GHG Protocol" },
    ],
    scope3: [
      {
        id: 8,
        name: "Business Travel - Flight (Short Haul)",
        category: "Business Travel",
        unit: "km",
        factor: 0.15,
        source: "DEFRA",
      },
      {
        id: 9,
        name: "Business Travel - Flight (Long Haul)",
        category: "Business Travel",
        unit: "km",
        factor: 0.11,
        source: "DEFRA",
      },
      {
        id: 10,
        name: "Employee Commuting - Car",
        category: "Employee Commuting",
        unit: "km",
        factor: 0.17,
        source: "EPA",
      },
      { id: 11, name: "Waste - Landfill", category: "Waste Disposal", unit: "kg", factor: 0.58, source: "EPA" },
      { id: 12, name: "Purchased Goods - Paper", category: "Purchased Goods", unit: "kg", factor: 0.94, source: "EPA" },
    ],
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
                  <Select>
                    <SelectTrigger id="category" className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {addDialogScope && scopeCategories[addDialogScope as keyof typeof scopeCategories].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>dDialogScope(value)}>
                    <SelectTrigger id="scope" className="col-span-3">
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scope1">Scope 1</SelectItem>
                      <SelectItem value="scope2">Scope 2</SelectItem>
                      <SelectItem value="scope3">Scope 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select>
                    <SelectTrigger id="category" className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeCategories[addDialogScope as keyof typeof scopeCategories].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddDialogOpen(false)}>
                  Add Material
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scope1" onValueChange={setActiveScope}>
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
                      {materials[scope].map((material) => (
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
                              <Button variant="ghost" size="icon">
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
                <Select defaultValue={selectedMaterial.category}>
                  <SelectTrigger id="edit-category" className="col-span-3">
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
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveMaterial}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

