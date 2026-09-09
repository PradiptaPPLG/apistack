import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileSearch } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] mb-6">
        <FileSearch size={36} className="text-[var(--muted-foreground)]" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Page not found</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="secondary" size="md" className="gap-2">
            <ArrowLeft size={15} />
            Go home
          </Button>
        </Link>
        <Link href="/explore">
          <Button size="md">Explore APIs</Button>
        </Link>
      </div>
    </div>
  )
}
