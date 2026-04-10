"use client";

import { useState, useEffect, ReactNode } from "react";
import { AdminHeader } from "@/components/layouts/admin-header";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import Image from "next/image";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // Tailwind lg breakpoint
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Sidebar width depending on collapse state
  const sidebarWidth = collapsed ? "w-16" : "w-64";

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="flex h-full flex-col bg-gray-50 overflow-hidden">
        {/* Header aligned with sidebar */}
        <div className="sticky top-0 z-40 flex bg-gray-50 shadow-sm">
          {/* Sidebar placeholder for alignment */}
          {isDesktop && (
            <div
              className={`${sidebarWidth} transition-all duration-300 relative h-16 overflow-hidden bg-gray-100`}
            >
              {!collapsed && (
                <>
                  <Image
                    src="/adp-header-crop.jpeg"
                    alt="Indian nutrition professionals collaborating"
                    fill
                    priority
                    className="object-cover object-left"
                  />

                  {/* Optional professional overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 to-transparent" />
                </>
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <AdminHeader
              onMenuClick={() => {
                if (isDesktop) {
                  setCollapsed((prev) => !prev); // collapse toggle
                } else {
                  setSidebarOpen(true); // mobile overlay
                }
              }}
            />
          </div>
        </div>

        {/* Sidebar + Main Content */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          {isDesktop ? (
            <div className={`${sidebarWidth} transition-all duration-300`}>
              <AdminSidebar
                isOpen
                onClose={() => setSidebarOpen(false)}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
              />
            </div>
          ) : (
            <>
              {sidebarOpen && (
                <div
                  className="fixed inset-0 z-40 bg-black/40"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
              <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
              >
                <AdminSidebar
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  collapsed={false}
                  setCollapsed={setCollapsed}
                />
              </div>
            </>
          )}

          {/* Main column with internal scroll */}
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
