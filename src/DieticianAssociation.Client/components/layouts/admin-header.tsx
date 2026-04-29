"use client"

import Link from "next/link"
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
import { useAuthStore } from "@/store/useAuthStore"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, LogOut, User, Settings, LayoutDashboard } from "lucide-react"

interface AdminHeaderProps {
  onMenuClick: () => void   // ✅ no need to pass collapsed, just toggle
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { logout, user } = useAuthStore()

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4">
      {/* Left side — menu toggle */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-secondary transition-colors duration-150"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-secondary transition-colors duration-150">
                <Avatar className="h-8 w-8 ring-2 ring-border">
                  <AvatarImage src={user.avatar || "/admin-placeholder.avif"} alt={user.name ?? ''} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-xs">
                    {(user?.name ?? '')
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-border" align="end" forceMount>
              <DropdownMenuLabel className="font-normal px-3 py-2.5">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="px-3 py-2 cursor-pointer">
                <Link href="/admin" className="flex items-center w-full">
                  <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="px-3 py-2 cursor-pointer">
                <Link href="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="px-3 py-2 cursor-pointer">
                <Link href="/admin/settings" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="px-3 py-2 cursor-pointer hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-sm">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
