"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { UserSidebar } from "@/components/layouts/user-sidebar"

interface UserLayoutProps {
  children: React.ReactNode
}

export function UserLayout({ children }: UserLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
        {isDesktop ? (
          <div className="hidden lg:block w-64 shrink-0">
            <UserSidebar isOpen onClose={() => setSidebarOpen(false)} />
          </div>
        ) : (
          <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
