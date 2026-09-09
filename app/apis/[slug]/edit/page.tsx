import type { Metadata } from 'next'
import { createSessionClient } from '@/lib/appwrite/server'
import { appwriteConfig } from '@/lib/appwrite/config'
import { redirect, notFound } from 'next/navigation'
import { ApiForm } from '@/components/api/api-form'
import { Pencil } from 'lucide-react'
import { Query } from 'node-appwrite'

interface EditApiPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: EditApiPageProps): Promise<Metadata> {
  const { slug } = await params
  return { title: `Edit API: ${slug}` }
}

export default async function EditApiPage({ params }: EditApiPageProps) {
  const { slug } = await params
  const { account, databases } = await createSessionClient()
  const { databaseId, collections } = appwriteConfig

  let user: any = null
  try {
    user = await account.get()
  } catch {
    redirect(`/login?next=/apis/${slug}/edit`)
  }

  // Fetch API by slug
  const { documents: apiDocs } = await databases.listDocuments(
    databaseId,
    collections.apis,
    [Query.equal('slug', slug), Query.limit(1)]
  )
  const apiDoc = apiDocs[0]
  if (!apiDoc) notFound()

  // Check ownership or admin
  if (apiDoc.owner_id !== user.$id) {
    let profile: any = null
    try { profile = await databases.getDocument(databaseId, collections.profiles, user.$id) } catch {}
    if (profile?.role !== 'admin') redirect('/dashboard')
  }

  // Fetch endpoints separately
  const { documents: endpointDocs } = await databases.listDocuments(
    databaseId,
    collections.apiEndpoints,
    [Query.equal('api_id', apiDoc.$id), Query.limit(100)]
  )

  const api = {
    ...apiDoc,
    id: apiDoc.$id,
    created_at: apiDoc.$createdAt,
    updated_at: apiDoc.$updatedAt,
    api_endpoints: endpointDocs.map((e) => ({
      ...e,
      id: e.$id,
      created_at: e.$createdAt,
    })),
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Pencil size={18} className="text-[var(--primary)]" />
          <h1 className="text-xl font-bold text-[var(--foreground)]">Edit API</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Update the details and endpoints for <strong className="text-[var(--foreground)]">{api.name as string}</strong>.
        </p>
      </div>

      <ApiForm userId={user.$id} initialData={api} mode="edit" />
    </div>
  )
}
