'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { API_CATEGORIES } from '@/lib/utils'

const AUTH_FILTERS = [
  { value: '', label: 'All Auth Types' },
  { value: 'none', label: 'No Auth' },
  { value: 'api_key', label: 'API Key' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'oauth2', label: 'OAuth 2.0' },
]

export function ExploreFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // reset pagination on filter change
    startTransition(() => {
      router.push(`/explore?${params.toString()}`, { scroll: false })
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateFilter('q', query)
  }

  function clearFilters() {
    setQuery('')
    startTransition(() => {
      router.push('/explore', { scroll: false })
    })
  }

  const hasFilters = searchParams.get('q') || searchParams.get('category') || searchParams.get('auth')

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          id="explore-search"
          type="search"
          placeholder="Search APIs by name, description, or tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search size={15} />}
          className="flex-1 h-10"
        />
        <Button type="submit" size="md" loading={isPending} className="px-5">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          id="category-filter"
          value={searchParams.get('category') ?? ''}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="h-8 text-xs w-auto"
        >
          <option value="">All Categories</option>
          {API_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>

        <Select
          id="auth-filter"
          value={searchParams.get('auth') ?? ''}
          onChange={(e) => updateFilter('auth', e.target.value)}
          className="h-8 text-xs w-auto"
        >
          {AUTH_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </Select>

        <Select
          id="sort-filter"
          value={searchParams.get('sort') ?? 'newest'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="h-8 text-xs w-auto"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A-Z</option>
          <option value="endpoints">Most endpoints</option>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1 text-xs text-[var(--muted-foreground)]"
          >
            <X size={12} />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
