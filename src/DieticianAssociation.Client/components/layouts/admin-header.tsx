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
import { Menu, LogOut, User, Settings, LayoutDashboard } from "lucide-react"

interface AdminHeaderProps {
  onMenuClick: () => void   // ✅ no need to pass collapsed, just toggle
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { logout, user } = useAuthStore()

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/80 h-16 flex items-center justify-between mr-4 shadow-sm">
      {/* Left side */}
      <div className="flex items-center">
        {/* Sidebar toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden hover:bg-gray-100 transition-colors duration-200" // ✅ visible on mobile always
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </Button>
        {/* On desktop, you might want it always visible to collapse/expand too */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hidden lg:flex hover:bg-gray-100 transition-colors duration-200" // ✅ desktop only collapse toggle
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-gray-100 transition-all duration-200 ring-2 ring-transparent hover:ring-blue-100">
                <Avatar className="h-9 w-9 ring-2 ring-gray-100">
                  <AvatarImage src={user.avatar || "/admin-placeholder.avif"} alt={user.name ?? ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {user?.name ?? ''
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 shadow-lg border-gray-200/80" align="end" forceMount>
              <DropdownMenuLabel className="font-normal px-3 py-2.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-gray-900">{user.name}</p>
                  <p className="text-xs leading-none text-gray-500">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200/80" />
              <DropdownMenuItem asChild className="px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                <Link href="/admin" className="flex items-center w-full">
                  <LayoutDashboard className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-sm">Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                <Link href="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-sm">Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                <Link href="/admin/settings" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-sm">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200/80" />
              <DropdownMenuItem onClick={logout} className="px-3 py-2.5 cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors focus:bg-red-50 focus:text-red-700">
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
