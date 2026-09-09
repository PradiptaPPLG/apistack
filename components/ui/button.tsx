'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] whitespace-nowrap select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent)] text-white hover:bg-[#6d28d9] active:scale-[0.98] shadow-lg shadow-[rgba(124,58,237,0.25)]',
        secondary:
          'bg-[var(--surface-raised)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted)] hover:border-[rgba(255,255,255,0.12)] active:scale-[0.98]',
        ghost:
          'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] active:scale-[0.98]',
        outline:
          'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-raised)] hover:border-[rgba(255,255,255,0.15)] active:scale-[0.98]',
        destructive:
          'bg-[rgba(239,68,68,0.12)] text-[#f87171] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.2)] active:scale-[0.98]',
        link:
          'text-[var(--primary)] hover:text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-6 text-base',
        xl: 'h-12 px-8 text-base',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
