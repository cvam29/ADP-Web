"use client"

import { useEffect, useState } from "react"

interface HydrationSafeProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

/**
 * Component that prevents hydration mismatches by ensuring
 * it only renders after the component has mounted on the client
 */
export function HydrationSafe({ 
  children, 
  fallback = null, 
  className 
}: HydrationSafeProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return fallback ? (
      <div className={className} suppressHydrationWarning>
        {fallback}
      </div>
    ) : null
  }

  return (
    <div className={className} suppressHydrationWarning>
      {children}
    </div>
  )
}

/**
 * Hook to check if the component is safely mounted and hydrated
 */
export function useHydrationSafe() {
  const [isSafe, setIsSafe] = useState(false)

  useEffect(() => {
    // Double-check we're in browser environment
    if (typeof window !== 'undefined') {
      setIsSafe(true)
    }
  }, [])

  return isSafe
}
