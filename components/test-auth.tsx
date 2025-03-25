"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { RefreshCw, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react'

export default function TestAuth() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    async function checkSession() {
      try {
        setLoading(true)
        setError(null)
        
        // First test connection
        try {
          const { error: pingError } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
          
          if (pingError) {
            console.error('Connection error:', pingError)
            setConnectionStatus('error')
          } else {
            setConnectionStatus('connected')
          }
        } catch (connErr) {
          console.error('Supabase connection test failed:', connErr)
          setConnectionStatus('error')
        }
        
        // Then check auth
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setError(error.message)
        } else {
          setSession(data.session)
        }
      } catch (e) {
        console.error('Unexpected error:', e)
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Development Auth Status</h2>
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded border">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            Supabase Connection
            {connectionStatus === 'checking' && <AlertTriangle className="h-4 w-4 ml-2 text-yellow-500" />}
            {connectionStatus === 'connected' && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
            {connectionStatus === 'error' && <WifiOff className="h-4 w-4 ml-2 text-red-500" />}
          </h3>
          
          {connectionStatus === 'checking' && <p className="text-sm text-yellow-600">Checking connection...</p>}
          {connectionStatus === 'connected' && <p className="text-sm text-green-600">Connected to Supabase</p>}
          {connectionStatus === 'error' && (
            <>
              <p className="text-sm text-red-600">Cannot connect to Supabase</p>
              <p className="text-xs mt-1">Check that your local Supabase is running or update your .env.local file</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs"
                onClick={() => window.open('http://localhost:54323', '_blank')}
              >
                Open Supabase Dashboard
              </Button>
            </>
          )}
        </div>
        
        <div className="p-3 bg-gray-50 rounded border">
          <h3 className="text-sm font-medium mb-2">Authentication</h3>
          {loading ? (
            <p className="text-sm">Checking authentication...</p>
          ) : error ? (
            <div className="text-sm text-red-600">
              <p>Error: {error}</p>
              <Button 
                size="sm"
                variant="outline"
                className="mt-2 text-xs"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </Button>
            </div>
          ) : session ? (
            <div className="text-sm text-green-600">
              <p>Authenticated!</p>
              <p className="text-xs text-gray-600 mt-1">User: {session.user.email}</p>
              <Button 
                size="sm"
                variant="outline"
                className="mt-2 text-xs"
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/login'
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="text-sm text-orange-600">
              <p>Not authenticated</p>
              <Button 
                size="sm"
                variant="outline"
                className="mt-2 text-xs"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 