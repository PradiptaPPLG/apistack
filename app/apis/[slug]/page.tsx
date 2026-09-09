import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApiTester } from '@/components/api/api-tester'
import { FavoriteButton } from '@/components/api/favorite-button'
import {
  Globe, Lock, ExternalLink, Pencil, Star,
  Zap, Clock, User, Tag, Shield
} from 'lucide-react'
import { formatDate, getMethodColor, cn } from '@/lib/utils'

interface ApiDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ApiDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: api } = await supabase
    .from('apis')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!api) return { title: 'API Not Found' }

  return {
    title: api.name,
    description: api.description ?? `Explore the ${api.name} API on ApiStack.`,
  }
}

const AUTH_LABEL: Record<string, string> = {
  none: 'No Auth',
  api_key: 'API Key',
  bearer: 'Bearer Token',
  oauth2: 'OAuth 2.0',
}

export default async function ApiDetailPage({ params }: ApiDetailPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: api } = await supabase
    .from('apis')
    .select('*, profiles(display_name, avatar_url, email, role), api_endpoints(*)')
    .eq('slug', slug)
    .single()

  if (!api) notFound()

  // Check visibility
  if (!api.is_public && api.owner_id !== user?.id) {
    // Check if user is admin
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') notFound()
    } else {
      notFound()
    }
  }

  // Check if user favorited
  let isFavorited = false
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('api_id', api.id)
      .single()
    isFavorited = !!fav
  }

  const isOwner = user?.id === api.owner_id
  const endpoints = api.api_endpoints ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h1 className="text-2xl font-bold text-[var(--foreground)]">{api.name}</h1>
                  {api.is_featured && (
                    <Badge variant="featured">
                      <Star size={10} />
                      Featured
                    </Badge>
                  )}
                  {!api.is_public && (
                    <Badge variant="warning">
                      <Lock size={9} />
                      Private
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <User size={11} />
                    {(api.profiles as any)?.display_name ?? (api.profiles as any)?.email}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} />
                    {formatDate(api.created_at)}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Zap size={11} />
                    v{api.version}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {user && (
                  <FavoriteButton apiId={api.id} userId={user.id} isFavorited={isFavorited} />
                )}
                {api.documentation_url && (
                  <a href={api.documentation_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" className="gap-1.5">
                      <ExternalLink size={13} />
                      Docs
                    </Button>
                  </a>
                )}
                {isOwner && (
                  <Link href={`/apis/${api.slug}/edit`}>
                    <Button variant="secondary" size="sm" className="gap-1.5">
                      <Pencil size={13} />
                      Edit
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {api.description && (
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6">
              {api.description}
            </p>
          )}

          {/* Long description */}
          {api.long_description && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 mb-6">
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">About</h2>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">
                {api.long_description}
              </p>
            </div>
          )}

          {/* API Tester */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">
              API Explorer
            </h2>
            <ApiTester
              endpoints={endpoints}
              baseUrl={api.base_url}
              authType={api.auth_type}
              authHeader={api.auth_header}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
          {/* Meta card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-raised)]">
              <h3 className="text-xs font-semibold text-[var(--foreground)]">Details</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[11px] text-[var(--muted-foreground)] mb-1">Base URL</p>
                <code className="text-xs font-mono text-[var(--foreground)] break-all">
                  {api.base_url}
                </code>
              </div>
              <div className="h-px bg-[var(--border)]" />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Category</p>
                  <p className="text-[var(--foreground)]">{api.category}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Version</p>
                  <p className="text-[var(--foreground)] font-mono">v{api.version}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Authentication</p>
                  <p className="text-[var(--foreground)]">{AUTH_LABEL[api.auth_type]}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Endpoints</p>
                  <p className="text-[var(--foreground)]">{endpoints.length}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Visibility</p>
                  <p className="text-[var(--foreground)] flex items-center gap-1">
                    {api.is_public ? (
                      <><Globe size={11} className="text-[#4ade80]" /> Public</>
                    ) : (
                      <><Lock size={11} className="text-[#fbbf24]" /> Private</>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Updated</p>
                  <p className="text-[var(--foreground)]">{formatDate(api.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {api.tags && api.tags.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Tag size={13} className="text-[var(--muted-foreground)]" />
                <h3 className="text-xs font-semibold text-[var(--foreground)]">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {api.tags.map((tag: string) => (
                  <Link key={tag} href={`/explore?q=${tag}`}>
                    <span className="rounded-full bg-[var(--surface-raised)] border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[rgba(255,255,255,0.12)] transition-colors cursor-pointer">
                      {tag}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Auth info */}
          {api.auth_type !== 'none' && (
            <div className="rounded-xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.06)] p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Shield size={13} className="text-[#fbbf24]" />
                <h3 className="text-xs font-semibold text-[#fbbf24]">Authentication Required</h3>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                This API requires <strong className="text-[var(--foreground)]">{AUTH_LABEL[api.auth_type]}</strong> authentication.
                {api.auth_header && (
                  <> Send your credentials in the <code className="font-mono text-[var(--primary)]">{api.auth_header}</code> header.</>
                )}
              </p>
            </div>
          )}

          {/* Quick snippet */}
          {endpoints.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-raised)]">
                <h3 className="text-xs font-semibold text-[var(--foreground)]">Quick Start</h3>
              </div>
              <div className="p-4">
                <pre className="text-[11px] font-mono text-[var(--muted-foreground)] leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`curl -X ${endpoints[0].method} \\
  "${api.base_url}${endpoints[0].path}"${api.auth_type !== 'none' && api.auth_header
  ? ` \\\n  -H "${api.auth_header}: <your-token>"`
  : ''}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
