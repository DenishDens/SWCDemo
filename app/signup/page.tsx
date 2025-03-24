"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createOrganization } from "@/lib/services/organization-service"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Create the user account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName
          }
        },
      })

      if (signUpError) throw signUpError
      
      let redirectMessage = "Check your email to confirm your account"
      
      // 2. If we have organization name, attempt to create it
      if (organizationName && data.user) {
        try {
          // First sign in to get the session
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (!signInError) {
            // Create the organization and add the user as owner
            const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            
            // Insert the organization
            const { data: orgData, error: orgError } = await supabase
              .from('organizations')
              .insert({
                name: organizationName,
                slug: slug,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select('id')
              .single()
            
            if (!orgError && orgData) {
              // Add the user as owner
              await supabase
                .from('organization_members')
                .insert({
                  organization_id: orgData.id,
                  user_id: data.user.id,
                  role: 'owner',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
            }
          }
        } catch (orgCreateErr) {
          console.error("Error creating organization during signup:", orgCreateErr)
          // We'll continue even if organization creation fails
          // A demo organization will be created in the auth callback
        }
      } else {
        // Demo organization will be created in the auth callback
        redirectMessage = "Check your email to confirm your account. A demo organization will be created for you automatically."
      }

      router.push(`/login?message=${encodeURIComponent(redirectMessage)}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-gray-500">Enter your details to get started</p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name (Optional)</Label>
              <Input
                id="organizationName" 
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Your company or organization name"
              />
              <p className="text-xs text-gray-500">
                If you don't specify an organization name, a demo organization will be created for you with a 14-day AI file upload trial
              </p>
            </div>
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}