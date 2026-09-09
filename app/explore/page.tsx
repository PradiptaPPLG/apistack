import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ApiCard, ApiCardSkeleton } from '@/components/api/api-card'
import { ExploreFilters } from './filters'
import { Badge } from '@/components/ui/badge'
import { Compass, PackageSearch } from 'lucide-react'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Explore APIs',
  description: 'Browse and discover hundreds of public APIs across all categories.',
}

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    auth?: string
    sort?: string
    page?: string
  }>
}

async function ApiGrid({ searchParams }: ExplorePageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const PAGE_SIZE = 24
  const page = parseInt(params.page ?? '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('apis')
    .select('*, profiles(display_name, avatar_url, email)', { count: 'exact' })
    .eq('is_public', true)

  // Apply filters
  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%,tags.cs.{${params.q}}`)
  }
  if (params.category) {
    query = query.eq('category', params.category)
  }
  if (params.auth) {
    query = query.eq('auth_type', params.auth as any)
  }

  // Sort
  switch (params.sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'endpoints':
      query = query.order('endpoint_count', { ascending: false })
      break
    default:
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: apis, count } = await query

  // Get user favorites
  let userFavoriteIds: string[] = []
  if (user) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('api_id')
      .eq('user_id', user.id)
    userFavoriteIds = favs?.map((f) => f.api_id) ?? []
  }

  const apisWithFavorites = (apis ?? []).map((api) => ({
    ...api,
    is_favorited: userFavoriteIds.includes(api.id),
  }))

  if (apisWithFavorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] mb-4">
          <PackageSearch size={28} className="text-[var(--muted-foreground)]" />
        </div>
        <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">No APIs found</h3>
        <p className="text-sm text-[var(--muted-foreground)] max-w-sm">
          {params.q
            ? `No APIs matched "${params.q}". Try different keywords or clear the filters.`
            : 'No APIs available in this category yet.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-[var(--muted-foreground)] mb-4">
        {count ?? 0} API{count !== 1 ? 's' : ''} found
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {apisWithFavorites.map((api) => (
          <ApiCard key={api.id} api={api as any} userId={user?.id} />
        ))}
      </div>
    </div>
  )
}

function ApiGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ApiCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Compass size={18} className="text-[var(--primary)]" />
          <h1 className="text-xl font-bold text-[var(--foreground)]">Explore APIs</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Discover and integrate APIs from our curated library.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ExploreFilters />
      </div>

      {/* Grid */}
      <Suspense fallback={<ApiGridSkeleton />}>
        <ApiGrid searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
