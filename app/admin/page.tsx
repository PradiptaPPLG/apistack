import type { Metadata } from 'next'
import { createSessionClient } from '@/lib/appwrite/server'
import { appwriteConfig } from '@/lib/appwrite/config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Query } from 'node-appwrite'
import {
  Shield, Users, Globe, Zap, Star, 
  CheckCircle2, XCircle, Package
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'ApiStack administration panel.',
}

export default async function AdminPage() {
  const { account, databases } = await createSessionClient()

  let user: any = null
  try {
    user = await account.get()
  } catch {
    redirect('/login')
  }

  const { databaseId, collections } = appwriteConfig

  // Check admin role
  let profile: any = null
  try {
    profile = await databases.getDocument(databaseId, collections.profiles, user.$id)
  } catch {}
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch counts (total field gives overall count regardless of limit)
  const [
    { total: userCount },
    { total: apiCount },
    { total: publicApiCount },
  ] = await Promise.all([
    databases.listDocuments(databaseId, collections.profiles, [Query.limit(1)]),
    databases.listDocuments(databaseId, collections.apis, [Query.limit(1)]),
    databases.listDocuments(databaseId, collections.apis, [Query.equal('is_public', true), Query.limit(1)]),
  ])

  // Fetch recent APIs
  const { documents: recentApiDocs } = await databases.listDocuments(
    databaseId,
    collections.apis,
    [Query.orderDesc('$createdAt'), Query.limit(10)]
  )

  // Manual join: get profiles for recent API owners
  const ownerIds = [...new Set(recentApiDocs.map((d) => d.owner_id as string))]
  const profilesMap: Record<string, any> = {}
  if (ownerIds.length > 0) {
    const { documents: profileDocs } = await databases.listDocuments(
      databaseId,
      collections.profiles,
      [Query.equal('$id', ownerIds), Query.limit(ownerIds.length)]
    )
    profileDocs.forEach((p) => { profilesMap[p.$id] = p })
  }

  const recentApis = recentApiDocs.map((doc) => ({
    ...doc,
    id: doc.$id,
    created_at: doc.$createdAt,
    profiles: profilesMap[doc.owner_id as string] ?? null,
  }))

  // Fetch recent users (profiles)
  const { documents: recentUserDocs } = await databases.listDocuments(
    databaseId,
    collections.profiles,
    [Query.orderDesc('$createdAt'), Query.limit(10)]
  )
  const recentUsers = recentUserDocs.map((doc) => ({ ...doc, id: doc.$id }))

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
          { label: 'Total Users', value: userCount, icon: Users, color: 'text-[#60a5fa]' },
          { label: 'Total APIs', value: apiCount, icon: Package, color: 'text-[var(--primary)]' },
          { label: 'Public APIs', value: publicApiCount, icon: Globe, color: 'text-[#4ade80]' },
          { label: 'Private APIs', value: apiCount - publicApiCount, icon: Zap, color: 'text-[#fbbf24]' },
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
            <Badge variant="secondary">{recentApis.length}</Badge>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentApis.map((api) => (
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
                      {api.profiles?.display_name ?? api.profiles?.email}
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
            <Badge variant="secondary">{recentUsers.length}</Badge>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-raised)] transition-colors">
                <div className="h-8 w-8 rounded-full bg-[var(--accent-muted)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center text-xs font-semibold text-[var(--primary)] flex-shrink-0">
                  {(u.display_name ?? u.email ?? '??').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {u.display_name ?? u.email}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)] truncate">{u.email}</p>
                </div>
                <div>
                  {u.role === 'admin' ? (
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
