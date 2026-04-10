import React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { usePreventDoubleClick } from '@/hooks/use-debounce'
import { Loader2 } from 'lucide-react'

interface DebouncedButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick: (...args: any[]) => Promise<any> | any
  debounceMs?: number
  loadingText?: string
  children: React.ReactNode
}

/**
 * A button component that prevents double-clicks and shows loading state
 */
export function DebouncedButton({
  onClick,
  debounceMs = 1000,
  loadingText,
  children,
  disabled,
  ...props
}: DebouncedButtonProps) {
  const [debouncedClick, isLoading] = usePreventDoubleClick(onClick, debounceMs)

  return (
    <Button
      {...props}
      onClick={debouncedClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || 'Loading...'}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

/**
 * A button specifically for form submissions with appropriate debounce timing
 */
export function SubmitButton({
  children,
  loadingText = 'Submitting...',
  ...props
}: Omit<DebouncedButtonProps, 'debounceMs'>) {
  return (
    <DebouncedButton
      {...props}
      debounceMs={2000} // 2 seconds for form submissions
      loadingText={loadingText}
      type="submit"
    >
      {children}
    </DebouncedButton>
  )
}

/**
 * A button specifically for delete actions with appropriate styling and timing
 */
export function DeleteButton({
  children = 'Delete',
  loadingText = 'Deleting...',
  ...props
}: Omit<DebouncedButtonProps, 'debounceMs'>) {
  return (
    <DebouncedButton
      {...props}
      debounceMs={1000} // 1 second for delete actions
      loadingText={loadingText}
      variant="destructive"
    >
      {children}
    </DebouncedButton>
  )
}
