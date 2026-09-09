import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApiForm } from '@/components/api/api-form'
import { Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Add API',
  description: 'Publish a new API to the ApiStack library.',
}

export default async function CreateApiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/create')

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Plus size={18} className="text-[var(--primary)]" />
          <h1 className="text-xl font-bold text-[var(--foreground)]">Add API</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Publish a new API to the ApiStack library and share it with the developer community.
        </p>
      </div>

      <ApiForm userId={user.id} mode="create" />
    </div>
  )
}
