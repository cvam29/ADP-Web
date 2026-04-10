"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UpdateRoleDtoRole } from "@/services/generated"
import { useAuth } from "@/contexts/auth-context"

const ADMIN_DASHBOARD_PERMISSION = "admin.dashboard.view"

type DashboardSwitcherProps = {
  className?: string
  compact?: boolean
  showLabel?: boolean
}

export function DashboardSwitcher({
  className,
  compact = false,
  showLabel = true,
}: DashboardSwitcherProps) {
  const pathname = usePathname()
  const { hasAnyRole, hasPermission } = useAuth()

  const canUseAdminWorkspace =
    hasAnyRole([
      UpdateRoleDtoRole.admin,
      UpdateRoleDtoRole.superAdmin,
    ]) && hasPermission(ADMIN_DASHBOARD_PERMISSION)

  if (!canUseAdminWorkspace) {
    return null
  }

  const options = [
    {
      href: "/dashboard",
      label: "Member Dashboard",
      description: "Personal activity, events, and certificates",
      icon: LayoutDashboard,
    },
    {
      href: "/admin",
      label: "Admin Dashboard",
      description: "Platform operations, users, and content",
      icon: ShieldCheck,
    },
  ]

  return (
    <div
      className={cn(
        "rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-3",
        className,
      )}
    >
      {showLabel ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Choose workspace</p>
            <p className="text-xs text-slate-600">Switch between member and admin views without logging out.</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800">Admin Access</Badge>
        </div>
      ) : null}

      <div className={cn("grid gap-2", compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 md:grid-cols-2")}>
        {options.map((option) => {
          const Icon = option.icon
          const active = pathname === option.href || pathname?.startsWith(`${option.href}/`)

          return (
            <Button
              key={option.href}
              asChild
              variant={active ? "default" : "outline"}
              className={cn(
                "h-auto justify-start rounded-xl px-4 py-3 text-left",
                active
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50",
              )}
            >
              <Link href={option.href}>
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 rounded-lg p-2",
                      active ? "bg-white/15" : "bg-emerald-50 text-emerald-700",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{option.label}</div>
                    {!compact ? <div className={cn("mt-1 text-xs", active ? "text-emerald-50" : "text-slate-500")}>{option.description}</div> : null}
                  </div>
                </div>
              </Link>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default DashboardSwitcher