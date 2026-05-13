'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import FoodGrid from '@/components/solo/FoodGrid'
import type { Food } from '@/lib/types'
import Link from 'next/link'

interface ReactionWithFood {
  id: string
  food_id: string
  reaction: 'like' | 'dislike' | 'skip'
  food: Food
}

interface ProfileClientProps {
  user: { id: string; email: string; displayName: string }
  initialReactions: ReactionWithFood[]
}

export default function ProfileClient({ user, initialReactions }: ProfileClientProps) {
  const [reactions, setReactions] = useState(initialReactions)
  const [tab, setTab] = useState<'liked' | 'disliked'>('liked')
  const supabase = createClient()

  const liked    = reactions.filter((r) => r.reaction === 'like').map((r) => r.food)
  const disliked = reactions.filter((r) => r.reaction === 'dislike').map((r) => r.food)

  async function removeReaction(foodId: string) {
    await supabase
      .from('reactions')
      .delete()
      .eq('user_id', user.id)
      .eq('food_id', foodId)
    setReactions((prev) => prev.filter((r) => r.food_id !== foodId))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-white text-2xl font-black">
          {user.displayName[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-900">{user.displayName}</h1>
          <p className="text-stone-400 text-sm">{user.email}</p>
        </div>
        <Link href="/explore" className="btn-secondary ml-auto text-sm py-2 px-4">
          Keep Swiping
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { emoji: '👍', count: liked.length,    label: 'Liked' },
          { emoji: '👎', count: disliked.length, label: 'Disliked' },
          { emoji: '🍽️', count: reactions.length, label: 'Total Rated' },
        ].map(({ emoji, count, label }) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="text-3xl font-black text-stone-900">{count}</div>
            <div className="text-stone-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex bg-stone-100 rounded-xl p-1 mb-6 max-w-sm">
        {(['liked', 'disliked'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t
                ? 'bg-white shadow-sm text-stone-900'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t === 'liked' ? `👍 Liked (${liked.length})` : `👎 Disliked (${disliked.length})`}
          </button>
        ))}
      </div>

      {/* Food grids */}
      {tab === 'liked' ? (
        <FoodGrid
          foods={liked}
          reaction="like"
          onRemove={removeReaction}
          emptyMessage="No liked foods yet — go explore!"
        />
      ) : (
        <FoodGrid
          foods={disliked}
          reaction="dislike"
          onRemove={removeReaction}
          emptyMessage="You haven't disliked anything yet"
        />
      )}

      {reactions.length === 0 && (
        <div className="text-center mt-12">
          <Link href="/explore" className="btn-primary">
            Start Exploring Foods 🍽️
          </Link>
        </div>
      )}
    </div>
  )
}
