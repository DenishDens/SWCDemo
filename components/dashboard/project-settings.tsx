"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Share2, Users, X, Clock } from "lucide-react"

interface ProjectMember {
  user_id: string
  email: string
  role: string
  joined_at: string
}

interface ProjectInvite {
  id: string
  email: string
  role: string
  code: string
  expires_at: string
  created_at: string
}

interface UserProfile {
  id: string
  email: string
}

interface ProjectSettingsProps {
  projectId: string
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ projectId }) => {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [invites, setInvites] = useState<ProjectInvite[]>([])
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("viewer")
  const { toast } = useToast()

  useEffect(() => {
    fetchMembers()
    fetchInvites()
  }, [projectId])

  const fetchMembers = async () => {
    try {
      const { data: projectMembers, error: projectError } = await supabase
        .from('project_members')
        .select('user_id, role, created_at')
        .eq('project_id', projectId)

      if (projectError) throw projectError

      // Get user emails through a join with auth.users
      const { data: userProfiles, error: profilesError } = await supabase
        .from('auth.users')
        .select('id, email')
        .in('id', projectMembers?.map(m => m.user_id) || [])

      if (profilesError) throw profilesError

      const combinedMembers = projectMembers?.map(pm => {
        const profile = userProfiles?.find(p => p.id === pm.user_id)
        return {
          user_id: pm.user_id,
          email: profile?.email || '',
          role: pm.role,
          joined_at: pm.created_at
        }
      }) || []

      setMembers(combinedMembers)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast({
        title: "Error",
        description: "Failed to load project members",
        variant: "destructive"
      })
    }
  }

  const fetchInvites = async () => {
    try {
      const { data: invites, error } = await supabase
        .from('project_invites')
        .select('*')
        .eq('project_id', projectId)
        .gt('expires_at', new Date().toISOString())

      if (error) throw error
      setInvites(invites || [])
    } catch (error) {
      console.error('Error fetching invites:', error)
      toast({
        title: "Error",
        description: "Failed to load project invites",
        variant: "destructive"
      })
    }
  }

  const handleInviteUser = async () => {
    if (!inviteEmail) return

    try {
      // Generate a unique invite code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      // Set expiration to 7 days from now
      const expires_at = new Date()
      expires_at.setDate(expires_at.getDate() + 7)
      
      const { error } = await supabase
        .from('project_invites')
        .insert({
          project_id: projectId,
          email: inviteEmail,
          role: inviteRole,
          code,
          expires_at: expires_at.toISOString(),
        })
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: `Invitation sent to ${inviteEmail}`,
      })
      
      setIsInviteDialogOpen(false)
      setInviteEmail("")
      setInviteRole("viewer")
      fetchInvites()
    } catch (error) {
      console.error('Error sending invite:', error)
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      })
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Member removed from project",
      })

      fetchMembers()
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      })
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('project_invites')
        .delete()
        .eq('id', inviteId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Invitation cancelled",
      })

      fetchInvites()
    } catch (error) {
      console.error('Error cancelling invite:', error)
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Project Settings</h1>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Project Members</CardTitle>
                <CardDescription>Manage who has access to this project</CardDescription>
              </div>
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Project
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {members.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Current Members</h3>
                    {members.map((member) => (
                      <div key={member.user_id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{member.email[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{member.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {invites.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Pending Invitations</h3>
                    {invites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{invite.email[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{invite.email}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">
                                {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Expires {new Date(invite.expires_at).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelInvite(invite.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {members.length === 0 && invites.length === 0 && (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No members yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Share this project to start collaborating with others
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your project settings</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add general settings here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
            <DialogDescription>
              Enter an email address and select a role to share this project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invite-email" className="text-right">
                Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                className="col-span-3"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invite-role" className="text-right">
                Role
              </Label>
              <select
                id="invite-role"
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser}>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectSettings
