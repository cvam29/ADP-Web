"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch — only render after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" : false

  const toggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDark
          ? "bg-primary border-primary"
          : "bg-secondary border-border",
      )}
    >
      {/* Sliding thumb */}
      <span
        className={cn(
          "pointer-events-none flex h-4 w-4 items-center justify-center rounded-full shadow-sm transition-transform duration-300",
          isDark
            ? "translate-x-6 bg-primary-foreground"
            : "translate-x-1 bg-background border border-border",
        )}
        aria-hidden="true"
      >
        {mounted && (
          isDark
            ? <Moon className="h-2.5 w-2.5 text-primary" />
            : <Sun className="h-2.5 w-2.5 text-muted-foreground" />
        )}
      </span>
    </button>
  )
}
