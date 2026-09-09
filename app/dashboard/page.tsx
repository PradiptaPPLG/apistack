import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ApiCard, ApiCardSkeleton } from '@/components/api/api-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus, LayoutDashboard, Heart, Globe, Lock,
  Zap, TrendingUp, PackageSearch
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your APIs and favorites.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's APIs
  const { data: myApis } = await supabase
    .from('apis')
    .select('*, profiles(display_name, avatar_url, email)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch favorites
  const { data: favorites } = await supabase
    .from('favorites')
    .select('api_id, apis(*, profiles(display_name, avatar_url, email))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const favoriteApis = (favorites ?? [])
    .map((f) => f.apis)
    .filter(Boolean) as any[]

  const stats = {
    totalApis: myApis?.length ?? 0,
    publicApis: myApis?.filter((a) => a.is_public).length ?? 0,
    privateApis: myApis?.filter((a) => !a.is_public).length ?? 0,
    totalFavorites: favorites?.length ?? 0,
    totalEndpoints: myApis?.reduce((sum, api) => sum + (api.endpoint_count ?? 0), 0) ?? 0,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard size={18} className="text-[var(--primary)]" />
            <h1 className="text-xl font-bold text-[var(--foreground)]">Dashboard</h1>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Welcome back, {profile?.display_name ?? user.email}
          </p>
        </div>
        <Link href="/create">
          <Button size="md" className="gap-2" id="dashboard-add-api">
            <Plus size={15} />
            Add API
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {[
          { label: 'My APIs', value: stats.totalApis, icon: Zap },
          { label: 'Public', value: stats.publicApis, icon: Globe },
          { label: 'Private', value: stats.privateApis, icon: Lock },
          { label: 'Favorites', value: stats.totalFavorites, icon: Heart },
          { label: 'Endpoints', value: stats.totalEndpoints, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
              <Icon size={14} className="text-[var(--muted-foreground)]" />
            </div>
            <span className="text-2xl font-bold text-[var(--foreground)]">{value}</span>
          </div>
        ))}
      </div>

      {/* My APIs */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">My APIs</h2>
          <Link href="/create">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Plus size={12} />
              New API
            </Button>
          </Link>
        </div>

        {!myApis || myApis.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] border-dashed bg-[var(--surface)] py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] mb-4">
              <PackageSearch size={24} className="text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
              No APIs yet
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-4 max-w-xs">
              Publish your first API to the ApiStack library and share it with the developer community.
            </p>
            <Link href="/create">
              <Button size="sm" className="gap-2">
                <Plus size={14} />
                Publish an API
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myApis.map((api) => (
              <div key={api.id} className="relative group">
                <ApiCard api={api as any} userId={user.id} />
                {/* Edit overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Link href={`/apis/${api.slug}/edit`}>
                    <Button variant="secondary" size="icon-sm" className="h-7 w-7 text-xs shadow-lg">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Favorites */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Favorites</h2>
          <Badge variant="secondary">{stats.totalFavorites}</Badge>
        </div>

        {favoriteApis.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] border-dashed bg-[var(--surface)] py-12 text-center">
            <Heart size={24} className="text-[var(--muted-foreground)] mb-3" />
            <p className="text-xs text-[var(--muted-foreground)] mb-3">
              APIs you favorite will appear here.
            </p>
            <Link href="/explore">
              <Button variant="secondary" size="sm">Browse APIs</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteApis.map((api) => (
              <ApiCard key={api.id} api={api} userId={user.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
