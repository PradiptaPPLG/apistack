import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import {
  Shield, Users, Globe, Zap, Star, Trash2,
  CheckCircle2, XCircle, Package
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'ApiStack administration panel.',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch stats
  const [
    { count: userCount },
    { count: apiCount },
    { count: publicApiCount },
    { data: recentApis },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('apis').select('*', { count: 'exact', head: true }),
    supabase.from('apis').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase
      .from('apis')
      .select('*, profiles(display_name, email)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] border border-[rgba(124,58,237,0.2)]">
          <Shield size={18} className="text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
          <p className="text-xs text-[var(--muted-foreground)]">ApiStack platform administration</p>
        </div>
        <Badge variant="featured" className="ml-auto">Admin</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: userCount ?? 0, icon: Users, color: 'text-[#60a5fa]' },
          { label: 'Total APIs', value: apiCount ?? 0, icon: Package, color: 'text-[var(--primary)]' },
          { label: 'Public APIs', value: publicApiCount ?? 0, icon: Globe, color: 'text-[#4ade80]' },
          { label: 'Private APIs', value: (apiCount ?? 0) - (publicApiCount ?? 0), icon: Zap, color: 'text-[#fbbf24]' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <span className="text-2xl font-bold text-[var(--foreground)]">{value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent APIs */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-raised)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent APIs</h2>
            <Badge variant="secondary">{recentApis?.length ?? 0}</Badge>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {(recentApis ?? []).map((api) => (
              <div key={api.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-raised)] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/apis/${api.slug}`}
                      className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate"
                    >
                      {api.name}
                    </Link>
                    {api.is_featured && <Star size={11} className="text-[#fbbf24] flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      {(api.profiles as any)?.display_name ?? (api.profiles as any)?.email}
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">·</span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">{formatDate(api.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {api.is_public ? (
                    <CheckCircle2 size={14} className="text-[#4ade80]" />
                  ) : (
                    <XCircle size={14} className="text-[var(--muted-foreground)]" />
                  )}
                  <Link href={`/apis/${api.slug}/edit`}>
                    <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-[var(--muted)]">
                      Edit
                    </Badge>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-raised)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent Users</h2>
            <Badge variant="secondary">{recentUsers?.length ?? 0}</Badge>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {(recentUsers ?? []).map((user) => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-raised)] transition-colors">
                <div className="h-8 w-8 rounded-full bg-[var(--accent-muted)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center text-xs font-semibold text-[var(--primary)] flex-shrink-0">
                  {(user.display_name ?? user.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {user.display_name ?? user.email}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)] truncate">{user.email}</p>
                </div>
                <div>
                  {user.role === 'admin' ? (
                    <Badge variant="default" className="text-[10px]">Admin</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">User</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
