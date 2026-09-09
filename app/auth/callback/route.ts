import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Upsert profile - assign admin role to specific email
      const email = data.user.email ?? ''
      const isAdmin = email === (process.env.ADMIN_EMAIL ?? 'pradipta02032009@gmail.com')

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          email,
          display_name: data.user.user_metadata?.full_name ?? null,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
          role: isAdmin ? 'admin' : 'user',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
          ignoreDuplicates: false,
        }
      )

      if (profileError) {
        console.error('Profile upsert error:', profileError)
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
}
