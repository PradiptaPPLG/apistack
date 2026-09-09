import { NextResponse, type NextRequest } from 'next/server'
import { appwriteConfig } from './lib/appwrite/config'

export async function middleware(request: NextRequest) {
  // Protect routes that require authentication
  const protectedPaths = ['/dashboard', '/create', '/admin']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  const sessionCookie = request.cookies.get(`a_session_${appwriteConfig.projectId}`)

  if (isProtectedPath && (!sessionCookie || !sessionCookie.value)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from login page
  if (request.nextUrl.pathname === '/login' && sessionCookie && sessionCookie.value) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
