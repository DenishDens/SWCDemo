import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus } from "lucide-react"

export default function TeamMembers() {
  // Mock data - in a real app, this would come from your API
  const members = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      organization: "Internal",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JD",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Editor",
      organization: "Internal",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JS",
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert@partner.com",
      role: "Viewer",
      organization: "Partner Co.",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "RJ",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily@consultant.com",
      role: "Viewer",
      organization: "Consultant LLC",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "ED",
    },
  ]

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>
      case "Editor":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Editor</Badge>
      case "Viewer":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Viewer</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage team members and their access permissions</CardDescription>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
              <div className="flex items-center">
                {member.organization !== "Internal" && (
                  <Badge variant="outline" className="mr-2">
                    {member.organization}
                  </Badge>
                )}
                {getRoleBadge(member.role)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

