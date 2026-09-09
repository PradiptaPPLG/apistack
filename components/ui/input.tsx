import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconRight, ...props }, ref) => {
    if (icon || iconRight) {
      return (
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 flex items-center text-[var(--muted-foreground)] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'flex h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors',
              'hover:border-[rgba(255,255,255,0.12)]',
              'focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-9',
              iconRight && 'pr-9',
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 flex items-center text-[var(--muted-foreground)]">
              {iconRight}
            </span>
          )}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors',
          'hover:border-[rgba(255,255,255,0.12)]',
          'focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
