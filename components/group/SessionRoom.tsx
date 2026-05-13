'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Food, Group, GroupMember, GroupReaction, GroupMatch } from '@/lib/types'
import FoodCard from '@/components/solo/FoodCard'
import MatchCelebration from '@/components/group/MatchCelebration'
import SessionTimer from '@/components/group/SessionTimer'
import SwipeCounter from '@/components/group/SwipeCounter'

interface SessionRoomProps {
  group: Group
  currentMember: GroupMember
  isHost: boolean
  allMembers: GroupMember[]
}

export default function SessionRoom({ group, currentMember, isHost, allMembers }: SessionRoomProps) {
  const [foods, setFoods] = useState<Food[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reacting, setReacting] = useState(false)
  const [groupReactions, setGroupReactions] = useState<GroupReaction[]>([])
  const [matchedFood, setMatchedFood] = useState<Food | null>(null)
  const [swipeCount, setSwipeCount] = useState(0)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const loadFoods = useCallback(async () => {
    // Get foods not yet reacted to by this member
    const { data: myReactions } = await supabase
      .from('group_reactions')
      .select('food_id')
      .eq('group_id', group.id)
      .eq('member_id', currentMember.id)

    const reactedIds = (myReactions ?? []).map((r) => r.food_id)
    setSwipeCount(reactedIds.length)

    let query = supabase.from('foods').select('*')
    if (reactedIds.length > 0) {
      query = query.not('id', 'in', `(${reactedIds.join(',')})`)
    }

    const { data } = await query.limit(50).order('created_at')
    if (data) setFoods(data)
  }, [group.id, currentMember.id, supabase])

  useEffect(() => {
    loadFoods()

    // Subscribe to group reactions for social signals
    const reactionsChannel = supabase
      .channel(`group:${group.code}:reactions`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_reactions', filter: `group_id=eq.${group.id}` },
        (payload) => {
          setGroupReactions((prev) => [...prev, payload.new as GroupReaction])
        }
      )
      .subscribe()

    // Subscribe to matches
    const matchesChannel = supabase
      .channel(`group:${group.code}:matches`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_matches', filter: `group_id=eq.${group.id}` },
        async (payload) => {
          const match = payload.new as GroupMatch
          const { data: food } = await supabase
            .from('foods')
            .select('*')
            .eq('id', match.food_id)
            .single()
          if (food) setMatchedFood(food)
        }
      )
      .subscribe()

    // Listen for session end
    const statusChannel = supabase
      .channel(`group:${group.code}:session-status`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'groups', filter: `id=eq.${group.id}` },
        (payload) => {
          if (payload.new?.status === 'ended') {
            router.push(`/group/${group.code}/results`)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(reactionsChannel)
      supabase.removeChannel(matchesChannel)
      supabase.removeChannel(statusChannel)
    }
  }, [group.id, group.code, currentMember.id, loadFoods, router, supabase])

  async function handleReact(reaction: 'like' | 'dislike' | 'skip') {
    const food = foods[currentIndex]
    if (!food || reacting) return

    setReacting(true)
    await supabase.from('group_reactions').insert({
      group_id: group.id,
      member_id: currentMember.id,
      food_id: food.id,
      reaction,
    })

    const newSwipeCount = swipeCount + 1
    setSwipeCount(newSwipeCount)

    // Check swipe limit
    if (group.mode === 'swipe_limit' && group.swipe_limit && newSwipeCount >= group.swipe_limit) {
      setDone(true)
    }

    setCurrentIndex((i) => i + 1)
    setReacting(false)
  }

  async function endSession() {
    await supabase
      .from('groups')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', group.id)
  }

  // Social signals for current food
  const currentFood = foods[currentIndex]
  const socialSignals = currentFood
    ? groupReactions
        .filter((r) => r.food_id === currentFood.id && r.reaction === 'like' && r.member_id !== currentMember.id)
        .map((r) => {
          const member = allMembers.find((m) => m.id === r.member_id)
          return member ? { memberName: member.display_name, avatarColor: member.avatar_color || '#f97316' } : null
        })
        .filter(Boolean) as Array<{ memberName: string; avatarColor: string }>
    : []

  if (done) {
    return (
      <div className="max-w-md mx-auto p-4 text-center py-20">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">You&apos;ve seen all your foods!</h2>
        <p className="text-stone-500 mb-6">
          Waiting for the other members to finish swiping...
        </p>
        <div className="animate-pulse text-stone-400">⏳ Waiting...</div>
      </div>
    )
  }

  if (!currentFood) {
    return (
      <div className="max-w-md mx-auto p-4 text-center py-20">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">You&apos;ve rated all foods!</h2>
        <p className="text-stone-500">Waiting for the group results...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Progress bars */}
      <div className="card p-4 space-y-3">
        {group.mode === 'time_limit' && group.started_at && group.time_limit_seconds && (
          <SessionTimer
            startedAt={group.started_at}
            timeLimitSeconds={group.time_limit_seconds}
            onExpired={isHost ? endSession : undefined}
          />
        )}
        {group.mode === 'swipe_limit' && group.swipe_limit && (
          <SwipeCounter current={swipeCount} limit={group.swipe_limit} />
        )}
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>{foods.length - currentIndex} foods left</span>
          <span>{allMembers.length} players</span>
        </div>
      </div>

      {/* Food card */}
      <FoodCard
        food={currentFood}
        onReact={handleReact}
        loading={reacting}
        socialSignals={socialSignals}
      />

      {/* Host end button */}
      {isHost && (
        <button onClick={endSession} className="btn-ghost w-full text-stone-400 text-sm">
          End Session Early
        </button>
      )}

      {/* Match celebration */}
      {matchedFood && (
        <MatchCelebration
          food={matchedFood}
          isHost={isHost}
          onDismiss={endSession}
          onContinue={() => setMatchedFood(null)}
        />
      )}
    </div>
  )
}
