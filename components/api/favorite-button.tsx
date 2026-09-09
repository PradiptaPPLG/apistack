'use client'

import { useState } from 'react'
import { Query, ID } from 'appwrite'
import { createBrowserClient } from '@/lib/appwrite/client'
import { appwriteConfig } from '@/lib/appwrite/config'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  apiId: string
  userId: string
  isFavorited: boolean
}

export function FavoriteButton({ apiId, userId, isFavorited: initialFavorited }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { databases } = createBrowserClient()

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    setFavorited(!favorited)

    try {
      if (favorited) {
        // Find the favorite document first, then delete it
        const { documents } = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.favorites,
          [
            Query.equal('user_id', userId),
            Query.equal('api_id', apiId),
            Query.limit(1),
          ]
        )
        if (documents.length > 0) {
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.favorites,
            documents[0].$id
          )
        }
      } else {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.favorites,
          ID.unique(),
          { user_id: userId, api_id: apiId }
        )
      }
      router.refresh()
    } catch {
      setFavorited(favorited) // revert on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      id={`favorite-${apiId}`}
      onClick={toggle}
      disabled={loading}
      className={cn(
        'flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-150',
        'hover:scale-110 active:scale-95',
        favorited
          ? 'text-[#f87171] hover:text-[#ef4444]'
          : 'text-[var(--muted-foreground)] hover:text-[#f87171]'
      )}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={14}
        className={cn('transition-all', favorited && 'fill-current')}
      />
    </button>
  )
}
