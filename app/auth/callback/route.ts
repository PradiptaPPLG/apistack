import { createAdminClient } from '@/lib/appwrite/server'
import { appwriteConfig } from '@/lib/appwrite/config'
import { NextResponse } from 'next/server'
import { ID, Query } from 'node-appwrite'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const userId = requestUrl.searchParams.get('userId')
  const secret = requestUrl.searchParams.get('secret')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (userId && secret) {
    const { account, databases } = createAdminClient()

    try {
      // Exchange secret for session token
      const session = await account.createSession(userId, secret)

      // Fetch user details to upsert profile
      const user = await account.get()
      const email = user.email

      // Check if profile exists
      const profiles = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.profiles,
        [Query.equal('email', email)]
      )

      if (profiles.total === 0) {
        // Create new profile
        const isAdmin = email === (process.env.ADMIN_EMAIL ?? 'pradipta02032009@gmail.com')
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.profiles,
          userId, // match profile ID with auth user ID
          {
            email,
            display_name: user.name || null,
            role: isAdmin ? 'admin' : 'user',
          }
        )
      }

      // Create response and set cookie
      const response = NextResponse.redirect(new URL(next, requestUrl.origin))
      
      response.cookies.set(`a_session_${appwriteConfig.projectId}`, session.secret, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })

      return response
    } catch (error) {
      console.error('Session creation failed:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
}
