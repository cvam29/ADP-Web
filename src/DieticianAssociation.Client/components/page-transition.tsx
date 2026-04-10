"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type PageTransitionProps = {
  children?: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState<"enter" | "entering" | "visible">("visible")
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // New page navigated — fade out then swap content
      setTransitionStage("enter")
      const t = setTimeout(() => {
        setDisplayChildren(children)
        prevPathname.current = pathname
        setTransitionStage("entering")
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitionStage("visible")
          })
        })
      }, 120)
      return () => clearTimeout(t)
    } else {
      setDisplayChildren(children)
    }
  }, [pathname, children])

  return (
    <div
      style={{
        opacity: transitionStage === "enter" ? 0 : 1,
        transform: transitionStage === "enter" ? "translateY(6px)" : "translateY(0)",
        transition: transitionStage === "entering" || transitionStage === "visible"
          ? "opacity 220ms ease-out, transform 220ms ease-out"
          : "none",
      }}
    >
      {displayChildren}
    </div>
  )
}

export default PageTransition
