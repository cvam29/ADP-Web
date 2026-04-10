"use client"

import { useEffect, useState } from "react"

/**
 * Hook to safely check if component has hydrated
 * Prevents hydration mismatches by ensuring client-only operations
 * happen after hydration is complete
 */
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Hook to safely access browser-only APIs
 * Returns undefined on server and during hydration
 */
export function useBrowserOnly<T>(fn: () => T): T | undefined {
  const isHydrated = useIsHydrated()
  
  if (!isHydrated || typeof window === 'undefined') {
    return undefined
  }
  
  return fn()
}

/**
 * Hook to safely get a value from localStorage
 * Returns null on server and during hydration
 */
export function useLocalStorage(key: string): string | null {
  return useBrowserOnly(() => localStorage.getItem(key)) ?? null
}

/**
 * Hook to safely check if we're in a browser environment
 */
export function useIsBrowser(): boolean {
  return typeof window !== 'undefined' && useIsHydrated()
}
