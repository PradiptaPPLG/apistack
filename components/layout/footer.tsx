import Link from 'next/link'
import { Zap, Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)]">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--foreground)]">ApiStack</span>
            <span className="text-xs text-[var(--muted-foreground)] ml-2">
              © {new Date().getFullYear()}
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/explore"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/create"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Submit API
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="GitHub"
            >
              <Github size={15} />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
