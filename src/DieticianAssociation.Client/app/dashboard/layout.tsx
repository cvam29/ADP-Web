'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  LayoutDashboard,
  Calendar,
  Award,
  Users,
  Briefcase,
  FlaskConical,
  LayoutGrid,
  GraduationCap,
  User,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  ArrowLeftRight,
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useAuth } from '@/contexts/auth-context'
import { UpdateRoleDtoRole } from '@/services/generated'
import { adminDashboardPermission, memberMainNav, memberResourceNav, type MemberNavItem } from '@/lib/member-access'

function isItemActive(href: string, pathname: string, exact?: boolean): boolean {
  if (exact) return pathname === href
  return pathname.startsWith(href)
}

function SidebarContent({
  collapsed,
  onLinkClick,
}: {
  collapsed: boolean
  onLinkClick?: () => void
}) {
  const pathname = usePathname()
  const { user, hasPermission } = useAuth()
  const isAdmin =
    user?.roleId === UpdateRoleDtoRole.admin ||
    user?.roleId === UpdateRoleDtoRole.superAdmin
  const canUseAdminWorkspace = isAdmin && hasPermission(adminDashboardPermission)
  const visibleMainNav = memberMainNav.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission),
  )
  const visibleResourceNav = memberResourceNav.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission),
  )

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?'

  return (
    <div className="flex flex-col h-full">
      {!collapsed && (
        <div className="flex items-center gap-3 border-b border-border px-4 py-5 transition-all">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">My Dashboard</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex justify-center border-b border-border px-3 py-4 transition-all">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 py-4">
        {/* Main nav */}
        <div className={cn('space-y-0.5', collapsed ? 'px-2' : 'px-3')}>
          {visibleMainNav.map((item) => {
            const Icon = item.icon
            const active = isItemActive(item.href, pathname, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onLinkClick}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  collapsed ? 'justify-center px-2' : 'px-3',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 flex-shrink-0',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                {!collapsed && <span className="flex-1">{item.label}</span>}
              </Link>
            )
          })}

          {canUseAdminWorkspace && (
            <Link
              href="/admin"
              onClick={onLinkClick}
              title={collapsed ? 'Admin Panel' : undefined}
              className={cn(
                'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                collapsed ? 'justify-center px-2' : 'px-3',
                pathname.startsWith('/admin')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <ShieldCheck
                className={cn(
                  'h-4 w-4 flex-shrink-0',
                  pathname.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              {!collapsed && <span className="flex-1">Admin Workspace</span>}
            </Link>
          )}
        </div>

        {/* Resources */}
        <div className={cn('mt-2', collapsed ? 'px-2' : 'px-3')}>
          {collapsed ? (
            <Separator className="my-3" />
          ) : (
              <div className="mb-2 px-3 mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Resources
              </p>
            </div>
          )}
          <div className="space-y-0.5">
            {visibleResourceNav.map((item) => {
              const Icon = item.icon
              const active = isItemActive(item.href, pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    collapsed ? 'justify-center px-2' : 'px-3',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      active ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                  {!collapsed && item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, isViewingAs, viewAsAdminUser, exitViewAs } = useAuth()
  const isAdmin =
    user?.roleId === UpdateRoleDtoRole.admin ||
    user?.roleId === UpdateRoleDtoRole.superAdmin
  const showWebsiteHeader = !isAdmin
  const stickyTopClass = showWebsiteHeader ? 'top-16' : 'top-0'
  const shellMinHeightClass = showWebsiteHeader
    ? 'min-h-[calc(100vh-4rem)]'
    : 'min-h-screen'
  const sidebarHeightClass = showWebsiteHeader
    ? 'h-[calc(100vh-4rem)]'
    : 'h-screen'

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?'

  const visibleMainNav = memberMainNav.filter(
    (item) => !item.requiredPermission || user?.effectivePermissions?.includes(item.requiredPermission),
  )
  const visibleResourceNav = memberResourceNav.filter(
    (item) => !item.requiredPermission || user?.effectivePermissions?.includes(item.requiredPermission),
  )
  const allNavItems: MemberNavItem[] = [
    ...visibleMainNav,
    ...visibleResourceNav,
    ...(isAdmin && user?.effectivePermissions?.includes(adminDashboardPermission)
      ? [{ label: 'Admin Workspace', href: '/admin', icon: ShieldCheck }]
      : []),
  ]

  const currentLabel =
    allNavItems
      .sort((a, b) => b.href.length - a.href.length) // longest match first
      .find((n) =>
        n.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(n.href),
      )?.label ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-background">
      {showWebsiteHeader ? <Header /> : null}

      <div className={cn('flex', shellMinHeightClass)}>
        {/* ─── Desktop sidebar ─── */}
        <div
          className={cn(
            'hidden lg:flex relative flex-col',
            collapsed ? 'w-16' : 'w-64 xl:w-72',
          )}
        >
          <div className="relative h-16 overflow-hidden border-r border-border bg-secondary/40">
            {!collapsed && (
              <>
                <Image
                  src="/adp-header-crop.jpeg"
                  alt="Indian nutrition professionals collaborating"
                  fill
                  priority
                  className="object-cover object-left"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/35 to-transparent" />
              </>
            )}
          </div>
          <aside
            className={cn(
              'flex flex-col border-r border-border bg-card flex-shrink-0 sticky transition-all duration-300 w-full',
              showWebsiteHeader ? 'top-32 h-[calc(100vh-8rem)]' : stickyTopClass,
              showWebsiteHeader ? '' : sidebarHeightClass,
            )}
          >
          <SidebarContent collapsed={collapsed} />

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-border bg-card shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
          </aside>
        </div>

        {/* ─── Mobile drawer ─── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-card shadow-xl flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Navigation</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SidebarContent collapsed={false} onLinkClick={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* ─── Main content ─── */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Topbar */}
          <div className={cn('bg-card border-b border-border px-5 py-3 flex items-center gap-4 sticky z-10', stickyTopClass)}>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 flex-shrink-0"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-foreground truncate">{currentLabel}</h1>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <ThemeToggle />
              <NotificationCenter />
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-5 md:p-7 space-y-5">
            {isViewingAs ? (
              <Alert className="border-amber-300 bg-amber-50 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200 [&>svg]:text-amber-700 dark:[&>svg]:text-amber-400">
                <ArrowLeftRight className="h-4 w-4" />
                <AlertTitle>Viewing as {user?.name}</AlertTitle>
                <AlertDescription className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <span>
                    You are viewing this member dashboard as an administrator.
                    {viewAsAdminUser?.name ? ` Return to ${viewAsAdminUser.name}'s admin dashboard when finished.` : ' Return to the admin dashboard when finished.'}
                  </span>
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40"
                    onClick={() => {
                      void exitViewAs()
                    }}
                  >
                    Return to Admin Dashboard
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
