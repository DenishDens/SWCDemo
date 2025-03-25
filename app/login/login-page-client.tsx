"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Check if we're in development mode for demo features
const isDevelopment = 
  typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development' || 
  typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export default function LoginPageClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("password123")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const [settingUpDemo, setSettingUpDemo] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'warning'>('success')

  useEffect(() => {
    // Check for error or success messages in URL parameters
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    
    if (errorParam) {
      let errorMessage = 'Authentication failed'
      // Map error codes to user-friendly messages
      switch (errorParam) {
        case 'missing_code':
          errorMessage = 'Authentication process was interrupted. Please try again.'
          break
        case 'session_error':
          errorMessage = 'Unable to create your session. Please try again.'
          break
        case 'auth_callback_error':
          errorMessage = 'An unexpected error occurred during login. Please try again.'
          break
        case 'connection_error':
          errorMessage = 'Unable to connect to authentication service. Please check your internet connection and try again.'
          break
        default:
          // Use the raw error if it's a direct message
          errorMessage = decodeURIComponent(errorParam)
      }
      setError(errorMessage)
    }
    
    if (messageParam) {
      setSuccess(decodeURIComponent(messageParam))
    }
  }, [searchParams])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Email and password are required")
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      console.log("Attempting to sign in with:", email)
      
      // Set a timeout to handle network issues
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // Add timeout for login
      const timeoutPromise = new Promise<{ data: any, error: any }>((resolve) => {
        setTimeout(() => {
          resolve({ 
            data: null, 
            error: { message: "Login request timed out. Please check your connection and try again." } 
          })
        }, 5000)
      })
      
      const { data, error: signInError } = await Promise.race([signInPromise, timeoutPromise])
      
      if (signInError) {
        console.error("Login error:", signInError.message)
        
        // Check if the error is due to email not being confirmed
        if (signInError.message.includes('Email not confirmed')) {
          setError("Please check your email to confirm your account before signing in.")
          return
        }
        
        // For demo purposes - if using demo credentials and getting invalid user error, try to create the user
        if (email === "demo@example.com" && password === "password123" && 
            (signInError.message.includes("Invalid") || signInError.message.includes("user") || signInError.message.includes("password"))) {
          
          console.log("Demo user not found, attempting to create demo user...")
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: "demo@example.com",
            password: "password123",
            options: {
              data: {
                full_name: "Demo User",
              }
            }
          })
          
          if (signUpError) {
            console.error("Failed to create demo user:", signUpError)
            setError("Demo user login failed. Please check your connection to Supabase.")
          } else {
            setError("Please check your email to confirm your demo account before signing in.")
          }
        } else {
          // For regular users, try to sign up if the user doesn't exist
          if (signInError.message.includes("Invalid") || signInError.message.includes("user") || signInError.message.includes("password")) {
            const { error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
              },
            })
            
            if (signUpError) {
              setError(signUpError.message)
            } else {
              setError("Please check your email to confirm your account before signing in.")
            }
          } else {
            setError(signInError.message)
          }
        }
        return
      }
      
      if (!data?.session) {
        console.error("No session returned after login")
        setError("Authentication failed. Please try again.")
        return
      }
      
      console.log("Login successful, redirecting...")
      
      await router.push("/dashboard")
    } catch (err: any) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const setupDemoUser = async () => {
    if (!isDevelopment) return
    
    try {
      setSettingUpDemo(true)
      setError(null)
      
      const response = await fetch('/api/setup-demo', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up demo user')
      }
      
      // Auto-fill the demo credentials
      setEmail('demo@example.com')
      setPassword('password123')
      
      // Show success message
      setMessage('Demo user created! Please check your email to confirm your account.')
      setMessageType('success')
      
      // Try to sign in after a short delay
      setTimeout(async () => {
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: 'demo@example.com',
            password: 'password123',
          })
          
          if (signInError) {
            if (signInError.message.includes('Email not confirmed')) {
              setMessage('Please check your email to confirm your account before signing in.')
              setMessageType('warning')
            } else {
              setError(signInError.message)
            }
          }
        } catch (e) {
          console.error('Sign in error:', e)
          setError('Failed to sign in with demo account')
        }
      }, 2000)
    } catch (e) {
      console.error('Setup error:', e)
      setError(e instanceof Error ? e.message : 'Failed to set up demo user')
    } finally {
      setSettingUpDemo(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center w-full max-w-md p-8 mx-auto">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-green-600">CARBONLY</h1>
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link href="/signup" className="font-medium text-green-600 hover:text-green-500">
              start your 14-day free trial
            </Link>
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-500">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button variant="outline" className="w-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 16.9913 5.65686 21.1283 10.4375 21.8785V14.8906H7.89844V12H10.4375V9.79688C10.4375 7.29063 11.9304 5.90625 14.2146 5.90625C15.3087 5.90625 16.4531 6.10156 16.4531 6.10156V8.5625H15.1921C13.9499 8.5625 13.5625 9.33334 13.5625 10.1242V12H16.3359L15.8926 14.8906H13.5625V21.8785C18.3431 21.1283 22 16.9913 22 12Z"
                    fill="#1877F2"
                  />
                  <path
                    d="M15.8926 14.8906L16.3359 12H13.5625V10.1242C13.5625 9.33334 13.9499 8.5625 15.1921 8.5625H16.4531V6.10156C16.4531 6.10156 15.3087 5.90625 14.2146 5.90625C11.9304 5.90625 10.4375 7.29063 10.4375 9.79688V12H7.89844V14.8906H10.4375V21.8785C11.2852 22.0405 12.1348 22.0405 12.9824 21.8785V14.8906H15.8926Z"
                    fill="white"
                  />
                </svg>
                Facebook
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-green-600 hover:text-green-500">
            Sign up for a free trial
          </Link>
        </p>
        
        <div className="mt-4 text-center text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
          <strong>Demo Credentials:</strong><br />
          Email: demo@example.com<br />
          Password: password123
          
          {isDevelopment && (
            <div className="mt-2">
              <Button 
                onClick={setupDemoUser} 
                disabled={settingUpDemo} 
                variant="outline" 
                className="w-full text-xs"
              >
                {settingUpDemo ? "Setting up demo..." : "Setup Demo User in Supabase"}
              </Button>
              <p className="text-xs mt-1">This will create a demo user and organization in your local Supabase instance</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

