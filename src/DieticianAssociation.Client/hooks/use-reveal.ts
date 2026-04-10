"use client"

import { useEffect, useRef } from "react"

/**
 * Attach to a container ref to trigger scroll-based entrance animations.
 * Elements inside with the class `reveal` will gain `is-visible` when
 * they enter the viewport, activating CSS transitions defined in globals.css.
 */
export function useReveal(rootMargin = "-60px") {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const targets = el.querySelectorAll<HTMLElement>(".reveal")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin, threshold: 0.05 }
    )

    targets.forEach((t) => observer.observe(t))

    return () => observer.disconnect()
  }, [rootMargin])

  return ref
}
