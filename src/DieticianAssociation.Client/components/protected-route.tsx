"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { UpdateRoleDtoRole, type UpdateRoleDtoRole as UpdateRoleDtoRoleType } from "@/services/generated"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ADPSpinner } from "@/components/ui/adp-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UpdateRoleDtoRoleType[]
  requiredPermissions?: string[]
  requireAuth?: boolean
  requireActiveMembership?: boolean
  fallbackPath?: string
}

const hasMembershipBypassRole = (roleId?: number, role?: string | null) => {
  if (roleId === UpdateRoleDtoRole.admin || roleId === UpdateRoleDtoRole.superAdmin) {
    return true
  }

  const normalizedRole = role?.trim().toLowerCase()
  return normalizedRole === "admin" || normalizedRole === "superadmin" || normalizedRole === "super_admin"
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAuth = true,
  requireActiveMembership = false,
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const { user, loading, isHydrated, mustResetPassword, hasActiveMembership, hasAnyPermission } = useAuth()
  const router = useRouter()
  const canBypassMembership = hasMembershipBypassRole(user?.roleId, user?.role)

  useEffect(() => {
    if (isHydrated && !loading) {
      if (requireAuth && !user) {
        const currentPath = window.location.pathname
        router.push(`${fallbackPath}?redirect=${encodeURIComponent(currentPath)}`)
        return
      }

      if (requiredRoles.length > 0 && user && user.roleId !== undefined && !requiredRoles.includes(user.roleId as UpdateRoleDtoRoleType)) {
        router.push("/unauthorized")
        return
      }

      if (requiredPermissions.length > 0 && user && !hasAnyPermission(requiredPermissions)) {
        router.push("/unauthorized")
        return
      }

      if (requireActiveMembership && user && !canBypassMembership && !hasActiveMembership()) {
        router.push("/unauthorized")
        return
      }

      if (mustResetPassword && window.location.pathname !== "/reset-password") {
        router.push("/reset-password")
      }
    }
  }, [user, loading, isHydrated, requireAuth, requiredRoles, requiredPermissions, requireActiveMembership, mustResetPassword, hasActiveMembership, hasAnyPermission, canBypassMembership, router, fallbackPath])

  if (!isHydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ADPSpinner size="md" />
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  if (requiredRoles.length > 0 && user && user.roleId !== undefined && !requiredRoles.includes(user.roleId as UpdateRoleDtoRoleType)) {
    return null
  }

  if (requiredPermissions.length > 0 && user && !hasAnyPermission(requiredPermissions)) {
    return null
  }

  if (requireActiveMembership && user && !canBypassMembership && !hasActiveMembership()) {
    return null
  }

  return <>{children}</>
}
