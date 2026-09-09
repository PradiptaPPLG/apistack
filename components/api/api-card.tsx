import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Star, Globe, Lock, Zap, Heart } from 'lucide-react'
import { cn, truncate, formatRelativeDate } from '@/lib/utils'
import { FavoriteButton } from './favorite-button'

interface ApiWithFavorite {
  id: string
  name: string
  slug: string
  description?: string | null
  category: string
  tags?: string[] | null
  auth_type: string
  base_url: string
  version: string
  is_public: boolean
  is_featured?: boolean
  endpoint_count: number
  created_at: string
  owner_id: string
  profiles?: { display_name?: string | null; email?: string | null; avatar_url?: string | null } | null
  is_favorited?: boolean
  [key: string]: any
}

interface ApiCardProps {
  api: ApiWithFavorite
  userId?: string
}

const AUTH_LABEL: Record<string, string> = {
  none: 'No Auth',
  api_key: 'API Key',
  bearer: 'Bearer Token',
  oauth2: 'OAuth 2.0',
}

const CATEGORY_COLORS: Record<string, string> = {
  'AI & Machine Learning': 'bg-[rgba(168,85,247,0.08)] text-[#c084fc]',
  'Authentication': 'bg-[rgba(59,130,246,0.08)] text-[#60a5fa]',
  'Payment': 'bg-[rgba(34,197,94,0.08)] text-[#4ade80]',
  'Weather': 'bg-[rgba(245,158,11,0.08)] text-[#fbbf24]',
  'Maps': 'bg-[rgba(239,68,68,0.08)] text-[#f87171]',
}

export function ApiCard({ api, userId }: ApiCardProps) {
  const categoryColor = CATEGORY_COLORS[api.category] ?? 'bg-[var(--surface-raised)] text-[var(--muted-foreground)]'

  return (
    <div className="group relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-200 hover:border-[rgba(255,255,255,0.12)] hover:bg-[var(--surface-raised)] hover:-translate-y-0.5 overflow-hidden">
      {/* Featured indicator */}
      {api.is_featured && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#7c3aed]" />
      )}

      <Link
        href={`/apis/${api.slug}`}
        id={`api-card-${api.slug}`}
        className="flex flex-col flex-1 p-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                {api.name}
              </h3>
              {api.is_featured && (
                <Badge variant="featured" className="flex-shrink-0">
                  <Star size={9} />
                  Featured
                </Badge>
              )}
            </div>
            <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', categoryColor)}>
              {api.category}
            </span>
          </div>

          <div className="flex-shrink-0">
            {api.is_public ? (
              <Globe size={14} className="text-[var(--muted-foreground)]" />
            ) : (
              <Lock size={14} className="text-[var(--muted-foreground)]" />
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-4 flex-1">
          {truncate(api.description ?? 'No description provided.', 100)}
        </p>

        {/* Tags */}
        {api.tags && api.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {api.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-[var(--muted)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)] font-medium"
              >
                {tag}
              </span>
            ))}
            {api.tags.length > 3 && (
              <span className="rounded-md bg-[var(--muted)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)] font-medium">
                +{api.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Zap size={10} />
              {api.endpoint_count} endpoint{api.endpoint_count !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <span className={cn(
                'h-1.5 w-1.5 rounded-full',
                api.auth_type === 'none' ? 'bg-[#4ade80]' : 'bg-[#fbbf24]'
              )} />
              {AUTH_LABEL[api.auth_type]}
            </span>
          </div>
          <span className="font-mono text-[9px]">v{api.version}</span>
        </div>
      </Link>

      {/* Bottom actions */}
      <div className="flex items-center justify-between px-5 pb-4">
        <span className="text-[10px] text-[var(--muted-foreground)]">
          {api.profiles?.display_name ?? api.profiles?.email ?? 'Unknown'}
          {' · '}
          {formatRelativeDate(api.created_at)}
        </span>
        {userId && (
          <FavoriteButton
            apiId={api.id}
            userId={userId}
            isFavorited={api.is_favorited ?? false}
          />
        )}
      </div>
    </div>
  )
}

// Skeleton loader
export function ApiCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 gap-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-[var(--muted)] mb-2" />
          <div className="h-3 w-20 rounded-full bg-[var(--muted)]" />
        </div>
        <div className="h-3.5 w-3.5 rounded bg-[var(--muted)]" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-[var(--muted)]" />
        <div className="h-3 w-4/5 rounded bg-[var(--muted)]" />
      </div>
      <div className="flex gap-1">
        <div className="h-4 w-12 rounded bg-[var(--muted)]" />
        <div className="h-4 w-14 rounded bg-[var(--muted)]" />
      </div>
      <div className="h-px bg-[var(--border-subtle)]" />
      <div className="flex justify-between">
        <div className="h-3 w-24 rounded bg-[var(--muted)]" />
        <div className="h-3 w-8 rounded bg-[var(--muted)]" />
      </div>
    </div>
  )
}
