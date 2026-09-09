import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--accent-muted)] text-[var(--primary)] border-[rgba(124,58,237,0.2)]',
        secondary: 'bg-[var(--surface-raised)] text-[var(--muted-foreground)] border-[var(--border)]',
        outline: 'border-[var(--border)] text-[var(--muted-foreground)] bg-transparent',
        success: 'bg-[rgba(34,197,94,0.1)] text-[#4ade80] border-[rgba(34,197,94,0.2)]',
        warning: 'bg-[rgba(245,158,11,0.1)] text-[#fbbf24] border-[rgba(245,158,11,0.2)]',
        destructive: 'bg-[rgba(239,68,68,0.1)] text-[#f87171] border-[rgba(239,68,68,0.2)]',
        featured: 'bg-gradient-to-r from-[rgba(124,58,237,0.2)] to-[rgba(168,85,247,0.2)] text-[#c084fc] border-[rgba(168,85,247,0.3)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
