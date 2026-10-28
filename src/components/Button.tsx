import type { ComponentProps } from 'react'

interface ButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean
}

export function Button({
  isLoading = false,
  disabled,
  className = '',
  children,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-base text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
