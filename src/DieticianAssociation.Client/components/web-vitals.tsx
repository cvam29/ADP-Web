"use client"

import { useEffect } from "react"

export function WebVitals() {
  useEffect(() => {
    if (typeof window === "undefined") return

    import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      const reportVital = (metric: { name: string; value: number; rating: string }) => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[Web Vital] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`)
        }
      }

      onCLS(reportVital)
      onINP(reportVital)
      onLCP(reportVital)
      onFCP(reportVital)
      onTTFB(reportVital)
    })
  }, [])

  return null
}
