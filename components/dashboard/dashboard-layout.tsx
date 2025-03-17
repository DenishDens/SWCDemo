"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  FileUp,
  Settings,
  Users,
  Database,
  CreditCard,
  LogOut,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AIAssistant from "@/components/dashboard/ai-assistant"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768) // Adjust breakpoint as needed
    }

    // Set initial value
    handleResize()

    // Listen for window resize events
    window.addEventListener("resize", handleResize)

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Check if sidebar collapsed state is stored in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedState = localStorage.getItem("sidebarCollapsed")
      if (storedState) {
        setSidebarCollapsed(storedState === "true")
      }
    }
  }, [])

  // Save sidebar collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", String(newState))
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Upload Files", href: "/dashboard/upload", icon: FileUp },
    { name: "Projects", href: "/dashboard/projects", icon: Database },
    { name: "Team", href: "/dashboard/team", icon: Users },
    { name: "Material Library", href: "/dashboard/materials", icon: Database },
    { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-green-600">CARBONLY</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full w-64"
            : sidebarCollapsed
              ? "w-16"
              : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center h-16 px-4 border-b border-gray-200 ${sidebarCollapsed && !isMobile ? "justify-center" : "justify-between"}`}
          >
            {(!sidebarCollapsed || isMobile) && (
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-green-600">CARBONLY</span>
              </Link>
            )}
            {sidebarCollapsed && !isMobile && (
              <div className="flex items-center justify-center">
                <span className="text-xl font-bold text-green-600">C</span>
              </div>
            )}
            {!isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
                {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            )}
          </div>
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    } ${sidebarCollapsed && !isMobile ? "justify-center" : ""}`}
                  >
                    <item.icon
                      className={`${sidebarCollapsed && !isMobile ? "mr-0" : "mr-3"} h-5 w-5 ${isActive ? "text-green-600" : "text-gray-400"}`}
                    />
                    {(!sidebarCollapsed || isMobile) && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div
            className={`flex items-center p-4 border-t border-gray-200 ${sidebarCollapsed && !isMobile ? "justify-center" : ""}`}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center ${sidebarCollapsed && !isMobile ? "w-auto p-0" : "w-full text-left"}`}
                >
                  <Avatar className={`h-8 w-8 ${sidebarCollapsed && !isMobile ? "" : "mr-2"}`}>
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  {(!sidebarCollapsed || isMobile) && (
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                      <p className="text-xs text-gray-500 truncate">john@example.com</p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Back to Home</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`${isMobile ? "pt-16" : ""} ${isMobile ? "pl-0" : sidebarCollapsed ? "pl-16" : "pl-64"} transition-all duration-300`}
      >
        <main className="container py-6 px-4 md:px-6">{children}</main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  )
}

