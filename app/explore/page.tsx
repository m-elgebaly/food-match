'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Food, GuestReaction } from '@/lib/types'
import FoodCard from '@/components/solo/FoodCard'
import GuestPrompt from '@/components/shared/GuestPrompt'

const GUEST_LIMIT = 5
const GUEST_KEY   = 'guestReactions'

export default function ExplorePage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [reacting, setReacting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [guestReactions, setGuestReactions] = useState<GuestReaction[]>([])
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const supabase = createClient()

  const loadFoods = useCallback(async (uid: string | null) => {
    setLoading(true)
    let query = supabase.from('foods').select('*')

    if (uid) {
      const { data: reacted } = await supabase
        .from('reactions')
        .select('food_id')
        .eq('user_id', uid)
        .eq('source', 'solo')
      // Deduplicate — user may have reacted to same food across multiple sessions
      const ids = [...new Set((reacted ?? []).map((r) => r.food_id))]
      if (ids.length) query = query.not('id', 'in', `(${ids.join(',')})`)
    } else {
      // Filter out guest-reacted foods
      const stored = localStorage.getItem(GUEST_KEY)
      const guest: GuestReaction[] = stored ? JSON.parse(stored) : []
      const ids = guest.map((r) => r.foodId)
      if (ids.length) query = query.not('id', 'in', `(${ids.join(',')})`)
    }

    const { data } = await query.order('created_at').limit(100)
    setFoods(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null
      setUserId(uid)

      if (!uid) {
        const stored = localStorage.getItem(GUEST_KEY)
        const guest: GuestReaction[] = stored ? JSON.parse(stored) : []
        setGuestReactions(guest)
      }

      loadFoods(uid)
    })
  }, [loadFoods, supabase])

  async function handleReact(reaction: 'like' | 'dislike' | 'skip') {
    const food = foods[index]
    if (!food || reacting) return

    setReacting(true)

    if (userId) {
      await supabase.from('reactions').insert({
        user_id: userId,
        food_id: food.id,
        reaction,
        source: 'solo',
        group_id: null,
      })
    } else {
      // Guest mode
      const newReaction: GuestReaction = {
        foodId: food.id,
        foodName: food.name,
        foodImage: food.image_url,
        reaction,
      }
      const updated = [...guestReactions, newReaction]
      setGuestReactions(updated)
      localStorage.setItem(GUEST_KEY, JSON.stringify(updated))

      if (updated.length >= GUEST_LIMIT && !dismissed) {
        setShowPrompt(true)
      }
    }

    setIndex((i) => i + 1)
    setReacting(false)
  }

  const currentFood = foods[index]
  const guestSwipes = guestReactions.length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🍽️</div>
          <p className="text-stone-500">Loading delicious foods...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-stone-900 mb-1">Explore Foods</h1>
        <p className="text-stone-500">Swipe to build your personal taste profile</p>
        {!userId && (
          <div className="mt-3 inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm px-4 py-2 rounded-full">
            <span>👤</span>
            <span>Guest mode — {GUEST_LIMIT - guestSwipes} free swipes left</span>
          </div>
        )}
      </div>

      {/* Progress */}
      {userId && foods.length > 0 && (
        <div className="mb-6 text-center text-sm text-stone-400">
          {index} rated · {foods.length - index} remaining
        </div>
      )}

      {/* Card or empty state */}
      {currentFood ? (
        <FoodCard
          food={currentFood}
          onReact={handleReact}
          loading={reacting}
        />
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">You&apos;ve rated everything!</h2>
          <p className="text-stone-500 mb-6">
            Check your profile to see your taste profile, or create a group session.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/profile" className="btn-primary">View Profile</a>
            <a href="/group/new" className="btn-secondary">Create Group</a>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {currentFood && (
        <p className="text-center text-stone-300 text-xs mt-6">
          👎 Dislike · ⏭ Skip · 👍 Like
        </p>
      )}

      {/* Guest prompt */}
      {showPrompt && !userId && (
        <GuestPrompt
          swipesUsed={guestSwipes}
          limit={GUEST_LIMIT}
          onDismiss={() => { setShowPrompt(false); setDismissed(true) }}
        />
      )}
    </div>
  )
}
