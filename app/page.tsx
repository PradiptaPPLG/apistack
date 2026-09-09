import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApiCard } from '@/components/api/api-card'
import {
  Zap, Search, Globe, Code2, Shield, Star,
  ArrowRight, Compass, CheckCircle2
} from 'lucide-react'

const FEATURES = [
  {
    icon: Search,
    title: 'Discover APIs Instantly',
    description: 'Search and filter from hundreds of categorized APIs. Find exactly what you need in seconds.',
  },
  {
    icon: Code2,
    title: 'Test Endpoints Live',
    description: 'Built-in API tester lets you make real requests directly from the browser — no setup needed.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Private APIs, team collaboration, and admin controls. Keep your APIs secure and organized.',
  },
  {
    icon: Star,
    title: 'Save Favorites',
    description: 'Bookmark APIs you love and build your personal API collection for quick access.',
  },
  {
    icon: Globe,
    title: 'Publish Your API',
    description: 'Share your API with the developer community. Add documentation, endpoints, and version info.',
  },
  {
    icon: Zap,
    title: 'Instant Integration',
    description: 'Copy-ready code snippets, clear documentation, and structured endpoints for fast integration.',
  },
]

const STATS = [
  { label: 'APIs Listed', value: '500+' },
  { label: 'Categories', value: '20' },
  { label: 'Developers', value: '10K+' },
  { label: 'Endpoints', value: '50K+' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch featured APIs for showcase
  const { data: featuredApis } = await supabase
    .from('apis')
    .select('*, profiles(display_name, avatar_url, email)')
    .eq('is_public', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(3)

  // Get user favorites
  let userFavoriteIds: string[] = []
  if (user) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('api_id')
      .eq('user_id', user.id)
    userFavoriteIds = favs?.map((f) => f.api_id) ?? []
  }

  const apisWithFavorites = (featuredApis ?? []).map((api) => ({
    ...api,
    is_favorited: userFavoriteIds.includes(api.id),
  }))

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-20 pb-24">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.12)_0%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <Badge variant="featured" className="mb-6 inline-flex">
            <Zap size={10} />
            The Modern API Library
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-[1.1] mb-6">
            Discover the APIs{' '}
            <span className="gradient-text">that power the web</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed mb-10">
            ApiStack is your central hub for discovering, exploring, and integrating APIs.
            Browse curated API collections, test endpoints live, and publish your own APIs to the community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/explore" id="hero-explore-cta">
              <Button size="xl" className="w-full sm:w-auto gap-2">
                <Compass size={18} />
                Explore APIs
              </Button>
            </Link>
            {!user && (
              <Link href="/login" id="hero-signup-cta">
                <Button variant="secondary" size="xl" className="w-full sm:w-auto gap-2">
                  Get started free
                  <ArrowRight size={16} />
                </Button>
              </Link>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {[
              'No credit card required',
              'Free to explore',
              'Publish your APIs',
            ].map((text) => (
              <span key={text} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <CheckCircle2 size={12} className="text-[#4ade80]" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-1">
                  {stat.value}
                </dt>
                <dd className="text-xs text-[var(--muted-foreground)]">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Featured APIs */}
      {apisWithFavorites.length > 0 && (
        <section className="px-4 sm:px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
                  Featured APIs
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Hand-picked APIs from our editorial team
                </p>
              </div>
              <Link href="/explore">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  View all
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apisWithFavorites.map((api) => (
                <ApiCard key={api.id} api={api as any} userId={user?.id} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features grid */}
      <section className="px-4 sm:px-6 py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3">
              Everything you need to work with APIs
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] max-w-xl mx-auto">
              ApiStack is built for developers who want a streamlined, beautiful way to discover and integrate APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[rgba(255,255,255,0.1)] hover:bg-[var(--surface-raised)] transition-all duration-200"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-muted)] mb-4">
                    <Icon size={16} className="text-[var(--primary)]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(124,58,237,0.3)] bg-[var(--accent-muted)] p-8 sm:p-12 text-center">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.2)_0%,transparent_70%)]" />
            </div>
            <h2 className="relative text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3">
              Ready to discover your next API?
            </h2>
            <p className="relative text-sm text-[var(--muted-foreground)] mb-8 max-w-md mx-auto">
              Join thousands of developers who use ApiStack to find, test, and integrate APIs faster.
            </p>
            <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/explore" id="cta-explore">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Compass size={16} />
                  Start exploring
                </Button>
              </Link>
              {!user && (
                <Link href="/login" id="cta-signup">
                  <Button variant="secondary" size="lg" className="gap-2 w-full sm:w-auto">
                    Create free account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
