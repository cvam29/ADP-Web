"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      richColors
      closeButton
      expand={false}
      gap={8}
      duration={4500}
      toastOptions={{
        classNames: {
          toast: [
            // Base layout
            "group flex w-full items-start gap-3",
            "min-w-[320px] max-w-[420px]",
            "rounded-xl border px-4 py-3.5",
            // Elegant shadow + backdrop
            "shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.32)]",
            // Neutral default (light)
            "bg-white/95 border-zinc-200/80 text-zinc-900",
            "backdrop-blur-md",
            // Neutral default (dark)
            "dark:bg-zinc-900/95 dark:border-zinc-700/60 dark:text-zinc-50",
          ].join(" "),
          title: "text-[13.5px] font-semibold leading-snug tracking-[-0.01em]",
          description: [
            "text-[12.5px] leading-relaxed mt-0.5",
            "text-zinc-500 dark:text-zinc-400",
          ].join(" "),
          // Progress bar
          loader: "bg-primary",
          // Action button
          actionButton: [
            "mt-2 h-7 rounded-md px-3 text-xs font-medium",
            "bg-zinc-900 text-white hover:bg-zinc-700",
            "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
            "transition-colors",
          ].join(" "),
          // Cancel button
          cancelButton: [
            "mt-2 h-7 rounded-md px-3 text-xs font-medium",
            "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
            "dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
            "transition-colors",
          ].join(" "),
          // Close button (×)
          closeButton: [
            "!bg-transparent !border-0",
            "text-zinc-400 hover:text-zinc-700",
            "dark:text-zinc-500 dark:hover:text-zinc-200",
            "transition-colors",
          ].join(" "),
          // Success
          success: [
            "!bg-emerald-50/95 !border-emerald-200/70 !text-emerald-900",
            "dark:!bg-emerald-950/90 dark:!border-emerald-800/60 dark:!text-emerald-100",
          ].join(" "),
          // Error
          error: [
            "!bg-red-50/95 !border-red-200/70 !text-red-900",
            "dark:!bg-red-950/90 dark:!border-red-800/60 dark:!text-red-100",
          ].join(" "),
          // Warning
          warning: [
            "!bg-amber-50/95 !border-amber-200/70 !text-amber-900",
            "dark:!bg-amber-950/90 dark:!border-amber-800/60 dark:!text-amber-100",
          ].join(" "),
          // Info
          info: [
            "!bg-sky-50/95 !border-sky-200/70 !text-sky-900",
            "dark:!bg-sky-950/90 dark:!border-sky-800/60 dark:!text-sky-100",
          ].join(" "),
        },
      }}
      style={
        {
          "--normal-bg": "hsl(0 0% 100% / 0.95)",
          "--normal-border": "hsl(214.3 31.8% 91.4%)",
          "--normal-text": "hsl(222.2 84% 4.9%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
