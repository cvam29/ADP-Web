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
    <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-between px-4">
      {/* Left side — menu toggle */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
        >
          <Menu className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150">
                <Avatar className="h-8 w-8 ring-2 ring-zinc-100 dark:ring-zinc-800">
                  <AvatarImage src={user.avatar || "/admin-placeholder.avif"} alt={user.name ?? ''} />
                  <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs">
                    {(user?.name ?? '')
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-zinc-200 dark:border-zinc-800" align="end" forceMount>
              <DropdownMenuLabel className="font-normal px-3 py-2.5">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-100">{user.name}</p>
                  <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400 mt-1">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
              <DropdownMenuItem asChild className="px-3 py-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <Link href="/admin" className="flex items-center w-full">
                  <LayoutDashboard className="mr-2 h-4 w-4 text-zinc-500" />
                  <span className="text-sm">Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="px-3 py-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <Link href="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4 text-zinc-500" />
                  <span className="text-sm">Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="px-3 py-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <Link href="/admin/settings" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4 text-zinc-500" />
                  <span className="text-sm">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
              <DropdownMenuItem onClick={logout} className="px-3 py-2 cursor-pointer hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors focus:bg-red-50 focus:text-red-700">
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
