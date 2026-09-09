import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ApiForm } from '@/components/api/api-form'
import { Pencil } from 'lucide-react'

interface EditApiPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: EditApiPageProps): Promise<Metadata> {
  const { slug } = await params
  return { title: `Edit API: ${slug}` }
}

export default async function EditApiPage({ params }: EditApiPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/apis/${slug}/edit`)

  const { data: api } = await supabase
    .from('apis')
    .select('*, api_endpoints(*)')
    .eq('slug', slug)
    .single()

  if (!api) notFound()

  // Check ownership or admin
  if (api.owner_id !== user.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') redirect('/dashboard')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Pencil size={18} className="text-[var(--primary)]" />
          <h1 className="text-xl font-bold text-[var(--foreground)]">Edit API</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Update the details and endpoints for <strong className="text-[var(--foreground)]">{api.name}</strong>.
        </p>
      </div>

      <ApiForm userId={user.id} initialData={api} mode="edit" />
    </div>
  )
}
