'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Zap, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    try {
      // We call our server route to initiate the OAuth flow
      window.location.href = '/api/auth/google'
    } catch {
      setError('Failed to connect to authentication service.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] shadow-lg shadow-[rgba(124,58,237,0.4)]">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-[var(--foreground)]">ApiStack</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Sign in to access your dashboard, save favorites, and publish APIs.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.08)] px-3.5 py-3">
              <AlertCircle size={15} className="text-[#f87171] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#f87171]">{error}</p>
            </div>
          )}

          <Button
            id="google-login-btn"
            onClick={handleGoogleLogin}
            loading={loading}
            variant="secondary"
            size="lg"
            className="w-full gap-3 border-[rgba(255,255,255,0.1)]"
          >
            {!loading && (
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </Button>

          <p className="mt-6 text-center text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            By signing in, you agree to our{' '}
            <Link href="#" className="text-[var(--primary)] hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          Just browsing?{' '}
          <Link href="/explore" className="text-[var(--primary)] hover:underline">
            Explore APIs →
          </Link>
        </p>
      </div>
    </div>
  )
}
