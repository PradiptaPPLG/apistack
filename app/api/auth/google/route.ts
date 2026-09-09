import { createAdminClient } from '@/lib/appwrite/server'
import { OAuthProvider } from 'node-appwrite'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { account } = createAdminClient()
  const origin = new URL(request.url).origin

  try {
    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Google,
      `${origin}/auth/callback`,
      `${origin}/login?error=auth_failed`
    )

    return redirect(redirectUrl)
  } catch (error) {
    console.error('OAuth initiation error:', error)
    return redirect('/login?error=auth_failed')
  }
}
