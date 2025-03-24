"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LayoutDashboard, Settings, FileText, Home, BarChart3, FileUp, Users, Database, CreditCard, AlertTriangle } from "lucide-react"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  // Navigation items
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Upload Files", href: "/dashboard/upload", icon: FileUp },
    { name: "Projects", href: "/dashboard/projects", icon: Database },
    { name: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle },
    { name: "Team", href: "/dashboard/team", icon: Users },
    { name: "Material Library", href: "/dashboard/materials", icon: Database },
    { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        <div
          className={`flex items-center h-16 px-4 border-b border-gray-200 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed ? (
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-green-600">CARBONLY</span>
            </Link>
          ) : (
            <div className="flex items-center justify-center">
              <span className="text-xl font-bold text-green-600">C</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={onToggle} className="text-gray-500 hover:text-gray-700">
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
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
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon className={`${collapsed ? "mr-0" : "mr-3"} h-5 w-5 ${isActive ? "text-green-600" : "text-gray-400"}`} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}