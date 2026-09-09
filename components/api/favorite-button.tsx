'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    setFavorited(!favorited)

    try {
      if (favorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('api_id', apiId)
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: userId, api_id: apiId })
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
