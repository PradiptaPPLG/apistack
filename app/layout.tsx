import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ApiStack — API Discovery & Management Platform',
    template: '%s | ApiStack',
  },
  description:
    'Discover, browse, and integrate APIs from one beautiful developer platform. Browse hundreds of APIs, save your favorites, and test endpoints instantly.',
  keywords: ['API', 'API discovery', 'developer tools', 'REST API', 'API library', 'API marketplace'],
  openGraph: {
    title: 'ApiStack — API Discovery & Management Platform',
    description: 'The modern API library for developers.',
    type: 'website',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
