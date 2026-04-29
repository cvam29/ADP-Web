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
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User profile picture"} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
              <Badge className="text-xs bg-secondary text-secondary-foreground border-0 mt-1 font-normal">{user?.role}</Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {canUseAdminWorkspace ? (
              <Link
                href="/admin"
                onClick={onClose}
                className={cn(
                  "flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 mt-2 border-t border-border pt-3",
                  pathname.startsWith("/admin")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <ShieldCheck className={cn("w-4 h-4 flex-shrink-0", pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground")} />
                <span>Admin Workspace</span>
              </Link>
            ) : null}
          </div>
        </nav>
      </div>
    </>
  )
}
