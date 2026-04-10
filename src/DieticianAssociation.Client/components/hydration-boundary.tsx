"use client"

import { useIsHydrated } from "@/hooks/use-hydration"
import { ADPSpinner } from "@/components/ui/adp-spinner"

interface HydrationBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that prevents hydration mismatches by showing a loading state
 * until the component is fully hydrated on the client side
 */
export function HydrationBoundary({ children, fallback }: HydrationBoundaryProps) {
  const isHydrated = useIsHydrated()

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {fallback || <ADPSpinner size="md" />}
      </div>
    )
  }

  return <>{children}</>
}
