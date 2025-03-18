
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function UserDropdown() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setUser(profile)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account"
      })
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center p-4 border-t border-gray-200">
      <Button variant="ghost" onClick={handleSignOut} className="justify-center gap-2 whitespace-nowrap w-full text-left">
        <span className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 mr-2">
          <img className="aspect-square h-full w-full" alt="User" src="/placeholder.svg?height=32&width=32" />
        </span>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      </Button>
    </div>
  )
}
