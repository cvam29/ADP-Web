"use client"
import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { UpdateRoleDtoRole } from "@/services/generated"
import { useRouter } from "next/navigation"

/**
 * Centralized admin guard.
 * Returns { isAdmin, checking } so pages can early-return while deciding.
 */
export function useAdminGuard() {
  const { loading, hasAnyRole, isHydrated, user } = useAuth()
  const router = useRouter()
  const redirected = useRef(false)
  const isAdmin = hasAnyRole([UpdateRoleDtoRole.admin, UpdateRoleDtoRole.superAdmin])

  useEffect(() => {
    // Wait for hydration to complete before making any decisions
    if (!isHydrated || loading) return

    // If user is logged out (null after hydration), redirect to login
    if (!user && !redirected.current) {
      redirected.current = true
      const currentPath = window.location.pathname
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    // If user exists but is not admin, redirect to unauthorized
    if (user && !isAdmin && !redirected.current) {
      redirected.current = true
      router.replace("/unauthorized")
    }
  }, [isHydrated, loading, user, isAdmin, router])

  // Return checking as true only during hydration or loading
  // Once hydrated and not loading, if user is null, we redirect (so checking is false)
  // If user exists, we check admin status (checking is false once we know the result)
  const isChecking = !isHydrated || loading
  
  return { isAdmin, checking: isChecking }
}
