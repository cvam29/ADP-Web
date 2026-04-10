"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type SpinnerSize = "xs" | "sm" | "md" | "lg"

const sizeConfig: Record<SpinnerSize, { wrapper: string; ring: string }> = {
  xs: { wrapper: "h-5 w-5",  ring: "border-[1.5px]" },
  sm: { wrapper: "h-8 w-8",  ring: "border-[2px]"  },
  md: { wrapper: "h-12 w-12", ring: "border-[2.5px]" },
  lg: { wrapper: "h-20 w-20", ring: "border-[3px]"  },
}

interface ADPSpinnerProps {
  size?: SpinnerSize
  className?: string
}

/**
 * ADP logo spinner — the branded loading indicator used across the site.
 * Sizes: xs (20px) | sm (32px) | md (48px) | lg (80px)
 */
export function ADPSpinner({ size = "md", className }: ADPSpinnerProps) {
  const { wrapper, ring } = sizeConfig[size]
  return (
    <div className={cn("relative shrink-0", wrapper, className)}>
      {/* Orbiting ring */}
      <div
        className={cn(
          "adp-loader-orbit absolute inset-0 rounded-full border-transparent border-t-emerald-500",
          ring,
        )}
      />
      {/* Logo disc */}
      <div className="absolute inset-[16%] overflow-hidden rounded-full bg-white shadow-[0_4px_12px_-4px_rgba(16,185,129,0.4)] ring-1 ring-emerald-100">
        <Image
          src="/ADP.svg"
          alt=""
          fill
          priority
          sizes="80px"
          className="object-contain p-[15%]"
        />
      </div>
    </div>
  )
}
