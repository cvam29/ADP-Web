import Image from "next/image"

import { cn } from "@/lib/utils"

type PageLoadingProps = {
  message?: string
  className?: string
  contentClassName?: string
  iconClassName?: string
  textClassName?: string
  minHeightClassName?: string
  direction?: "row" | "column"
}

export function PageLoading({
  message = "Loading...",
  className,
  contentClassName,
  iconClassName,
  textClassName,
  minHeightClassName = "min-h-[400px]",
  direction = "row",
}: PageLoadingProps) {
  const isRow = direction === "row"

  return (
    <div
      className={cn(
        "flex items-center justify-center px-4",
        minHeightClassName,
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center",
          isRow ? "gap-4" : "flex-col gap-5 text-center",
          contentClassName,
        )}
      >
        <div
          className={cn(
            "relative shrink-0",
            isRow ? "h-16 w-16" : "h-24 w-24",
            iconClassName,
          )}
        >
          <div className="adp-loader-orbit absolute inset-0 rounded-full border-[3px] border-transparent border-t-emerald-500" />
          <div className="absolute inset-[16%] overflow-hidden rounded-full bg-white shadow-[0_12px_24px_-16px_rgba(16,185,129,0.45)] ring-1 ring-emerald-100">
            <Image
              src="/ADP.svg"
              alt="Association of Dietetics Professionals logo"
              fill
              priority
              sizes="(max-width: 768px) 64px, 96px"
              className="object-contain p-2"
            />
          </div>
        </div>

        <div className={cn(isRow ? "min-w-0" : "max-w-sm")}> 
          {message ? (
            <p
              className={cn(
                "text-balance font-medium text-slate-700",
                isRow ? "text-sm" : "text-base",
                textClassName,
              )}
            >
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default PageLoading