import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './user-menu'
import { Button } from '@/components/ui/button'
import { Zap, Compass, Plus } from 'lucide-react'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[rgba(12,12,15,0.85)] backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          id="nav-logo"
          className="flex items-center gap-2 font-semibold text-[var(--foreground)] hover:opacity-80 transition-opacity"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] shadow-lg shadow-[rgba(124,58,237,0.4)]">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">ApiStack</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/explore"
            id="nav-explore"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors"
          >
            <Compass size={14} />
            Explore
          </Link>
          {user && (
            <Link
              href="/dashboard"
              id="nav-dashboard"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user && profile ? (
            <>
              <Link href="/create">
                <Button size="sm" className="hidden sm:inline-flex gap-1.5">
                  <Plus size={14} />
                  Add API
                </Button>
              </Link>
              <UserMenu profile={profile} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" id="nav-login">
                  Sign in
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" id="nav-signup">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
