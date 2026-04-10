/**
 * Thin proxy around Sonner — preserves the existing `toast({ title, description, variant })`
 * call shape used across all stores and components, while delegating rendering to Sonner.
 *
 * Supported variants (maps to Sonner's semantic types):
 *   "success"     → sonner.success()
 *   "error"       → sonner.error()
 *   "destructive" → sonner.error()
 *   "warning"     → sonner.warning()
 *   "info"        → sonner.info()
 *   default       → sonner()   (neutral)
 */
import {
  toast as sonner,
  type ExternalToast,
} from "sonner"

type ToastVariant = "default" | "success" | "error" | "destructive" | "warning" | "info"

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: ExternalToast["action"]
  id?: string | number
}

function toast({ title, description, variant, duration, action, id }: ToastOptions) {
  const opts: ExternalToast = { description, duration, action, id }
  const message = title ?? ""

  switch (variant) {
    case "success":
      return sonner.success(message, opts)
    case "error":
    case "destructive":
      return sonner.error(message, opts)
    case "warning":
      return sonner.warning(message, opts)
    case "info":
      return sonner.info(message, opts)
    default:
      return sonner(message, opts)
  }
}

// Expose Sonner's fluent API directly for convenience
toast.success = (title: string, opts?: ExternalToast) => sonner.success(title, opts)
toast.error = (title: string, opts?: ExternalToast) => sonner.error(title, opts)
toast.warning = (title: string, opts?: ExternalToast) => sonner.warning(title, opts)
toast.info = (title: string, opts?: ExternalToast) => sonner.info(title, opts)
toast.loading = (title: string, opts?: ExternalToast) => sonner.loading(title, opts)
toast.promise = sonner.promise
toast.dismiss = sonner.dismiss
toast.custom = sonner.custom

/** Backward-compat hook — returns `{ toast }` with no internal state (Sonner owns it). */
function useToast() {
  return { toast }
}

export { useToast, toast }

