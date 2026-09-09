import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 30) return formatDate(date)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export const API_CATEGORIES = [
  'AI & Machine Learning',
  'Authentication',
  'Communication',
  'Data & Analytics',
  'Developer Tools',
  'E-commerce',
  'Finance',
  'Geolocation',
  'Government',
  'Health',
  'IoT',
  'Maps',
  'Media',
  'News',
  'Payment',
  'Search',
  'Social',
  'Sports',
  'Transportation',
  'Weather',
] as const

export type ApiCategory = (typeof API_CATEGORIES)[number]

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const
export type HttpMethod = (typeof HTTP_METHODS)[number]

export const AUTH_TYPES = ['none', 'api_key', 'bearer', 'oauth2'] as const
export type AuthType = (typeof AUTH_TYPES)[number]

export function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'method-get',
    POST: 'method-post',
    PUT: 'method-put',
    PATCH: 'method-patch',
    DELETE: 'method-delete',
  }
  return colors[method] ?? 'method-get'
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '…'
}
