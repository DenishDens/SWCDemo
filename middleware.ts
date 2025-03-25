import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname
  
  // Skip auth check for non-protected routes
  if (!pathname.startsWith('/dashboard') && 
      !pathname.startsWith('/auth') && 
      pathname !== '/login' && 
      pathname !== '/signup') {
    return response
  }
  
  // Create supabase client
  try {
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    // Try to refresh session with timeout
    const sessionPromise = supabase.auth.getSession()
    
    // Set a timeout for the session fetch
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Session fetch timeout'))
      }, 3000) // 3 second timeout
    })
    
    // Race between fetching session and timeout
    const { data, error } = await Promise.race([
      sessionPromise,
      timeoutPromise.then(() => ({ data: { session: null }, error: null }))
    ]).catch(error => {
      console.warn('Auth middleware error:', error.message)
      return { data: { session: null }, error: null }
    })
    
    const session = data?.session
    
    // Redirect unauthenticated users from protected routes to login
    if ((!session || error) && pathname.startsWith('/dashboard')) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Redirect authenticated users from auth routes to dashboard
    if (session && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (e) {
    console.error('Auth middleware error:', e)
    // For protected routes, redirect to login with error on complete failure
    if (pathname.startsWith('/dashboard')) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('error', 'connection_error')
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  return response
}

// Match only specific paths for authentication checking
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/login',
    '/signup',
    // Exclude static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 