'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/supabase/database.types'
import { LogOut, Settings, User, LayoutDashboard, Shield } from 'lucide-react'

interface UserMenuProps {
  profile: Profile
}

export function UserMenu({ profile }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = profile.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : profile.email.slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        id="user-menu-trigger"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-0.5 transition-all hover:ring-2 hover:ring-[var(--accent)] hover:ring-offset-2 hover:ring-offset-[var(--background)]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name ?? 'User'}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[var(--accent-muted)] border border-[var(--accent)] flex items-center justify-center text-xs font-semibold text-[var(--primary)]">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div
          id="user-menu-dropdown"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in"
          role="menu"
        >
          {/* Profile info */}
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {profile.display_name ?? 'User'}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
              {profile.email}
            </p>
            {profile.role === 'admin' && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--accent-muted)] border border-[rgba(124,58,237,0.3)] px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                <Shield size={10} />
                Admin
              </span>
            )}
          </div>

          {/* Menu items */}
          <div className="p-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors"
              role="menuitem"
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors"
              role="menuitem"
            >
              <User size={15} />
              Profile
            </Link>
            {profile.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors"
                role="menuitem"
              >
                <Settings size={15} />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="p-1 border-t border-[var(--border)]">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#f87171] hover:bg-[rgba(239,68,68,0.08)] transition-colors"
              role="menuitem"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
