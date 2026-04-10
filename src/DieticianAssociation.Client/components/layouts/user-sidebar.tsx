"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/useAuthStore"
import { UpdateRoleDtoRole } from "@/services/generated"
import { User, Home, X, ShieldCheck, MessageSquareQuote, FileText } from "lucide-react"

interface UserSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: "Member Dashboard", href: "/dashboard", icon: Home },
  { name: "My Articles", href: "/dashboard/articles", icon: FileText },
  { name: "Testimonials", href: "/dashboard/testimonials", icon: MessageSquareQuote },
  { name: "Profile", href: "/profile", icon: User },
]

export function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const canUseAdminWorkspace =
    user?.roleId === UpdateRoleDtoRole.admin || user?.roleId === UpdateRoleDtoRole.superAdmin
  const userInitials = (user?.name || "U")
    .split(" ")
    .map((value) => value[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()


  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-emerald-100">
              <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User profile picture"} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <Badge className="text-xs bg-emerald-100 text-emerald-800 mt-1">{user?.role}</Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {canUseAdminWorkspace ? (
              <Link
                href="/admin"
                onClick={onClose}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Admin Workspace</span>
              </Link>
            ) : null}
          </div>
        </nav>
      </div>
    </>
  )
}
