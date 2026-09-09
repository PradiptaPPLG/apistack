import type { Metadata } from 'next'
import { createSessionClient } from '@/lib/appwrite/server'
import { appwriteConfig } from '@/lib/appwrite/config'
import { ApiCard, ApiCardSkeleton } from '@/components/api/api-card'
import { ExploreFilters } from './filters'
import { Compass, PackageSearch } from 'lucide-react'
import { Suspense } from 'react'
import { Query } from 'node-appwrite'

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
  const { account, databases } = await createSessionClient()

  let user: any = null
  try { user = await account.get() } catch {}

  const { databaseId, collections } = appwriteConfig
  const PAGE_SIZE = 24
  const page = parseInt(params.page ?? '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const queries: string[] = [
    Query.equal('is_public', true),
    Query.limit(PAGE_SIZE),
    Query.offset(offset),
  ]

  // Text search (requires Full Text index on 'name' in Appwrite console)
  if (params.q) {
    queries.push(Query.search('name', params.q))
  }
  if (params.category) {
    queries.push(Query.equal('category', params.category))
  }
  if (params.auth) {
    queries.push(Query.equal('auth_type', params.auth))
  }

  // Sort
  switch (params.sort) {
    case 'oldest':
      queries.push(Query.orderAsc('$createdAt'))
      break
    case 'name':
      queries.push(Query.orderAsc('name'))
      break
    case 'endpoints':
      queries.push(Query.orderDesc('endpoint_count'))
      break
    default:
      queries.push(Query.orderDesc('is_featured'))
      queries.push(Query.orderDesc('$createdAt'))
  }

  const { documents: apiDocs, total } = await databases.listDocuments(
    databaseId,
    collections.apis,
    queries
  )

  // Manual join: fetch profiles for API owners
  const ownerIds = [...new Set(apiDocs.map((d) => d.owner_id as string))]
  const profilesMap: Record<string, any> = {}
  if (ownerIds.length > 0) {
    const { documents: profileDocs } = await databases.listDocuments(
      databaseId,
      collections.profiles,
      [Query.equal('$id', ownerIds), Query.limit(ownerIds.length)]
    )
    profileDocs.forEach((p) => { profilesMap[p.$id] = p })
  }

  // Get user favorites
  let userFavoriteIds: string[] = []
  if (user) {
    const { documents: favDocs } = await databases.listDocuments(
      databaseId,
      collections.favorites,
      [Query.equal('user_id', user.$id), Query.limit(500)]
    )
    userFavoriteIds = favDocs.map((f) => f.api_id as string)
  }

  const apis = apiDocs.map((doc) => ({
    ...doc,
    id: doc.$id,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt,
    profiles: profilesMap[doc.owner_id as string] ?? null,
    is_favorited: userFavoriteIds.includes(doc.$id),
  }))

  if (apis.length === 0) {
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
        {total} API{total !== 1 ? 's' : ''} found
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {apis.map((api) => (
          <ApiCard key={api.id} api={api as any} userId={user?.$id} />
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
