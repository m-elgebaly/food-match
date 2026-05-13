import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ResultsBoard from '@/components/group/ResultsBoard'
import type { Food, GroupMember, GroupReaction, GroupMatch } from '@/lib/types'

interface ResultsPageProps {
  params: { code: string }
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the group
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('code', params.code)
    .single()

  if (!group) notFound()

  // Fetch all data in parallel
  const [membersRes, reactionsRes, matchesRes, foodsRes] = await Promise.all([
    supabase.from('group_members').select('*').eq('group_id', group.id),
    supabase.from('group_reactions').select('*').eq('group_id', group.id),
    supabase.from('group_matches').select('*').eq('group_id', group.id).order('matched_at'),
    supabase.from('foods').select('*'),
  ])

  const members:   GroupMember[]   = membersRes.data   ?? []
  const reactions: GroupReaction[] = reactionsRes.data ?? []
  const matchRows: GroupMatch[]    = matchesRes.data   ?? []
  const allFoods:  Food[]          = foodsRes.data     ?? []

  // Build matches with food data
  const matches = matchRows.map((m) => ({
    ...m,
    food: allFoods.find((f) => f.id === m.food_id)!,
  })).filter((m) => m.food)

  // Build popular ranking
  const likesByFood = reactions.filter((r) => r.reaction === 'like').reduce(
    (acc, r) => {
      acc[r.food_id] = acc[r.food_id] ?? { count: 0, memberIds: [] }
      acc[r.food_id].count++
      acc[r.food_id].memberIds.push(r.member_id)
      return acc
    },
    {} as Record<string, { count: number; memberIds: string[] }>
  )

  const popular = Object.entries(likesByFood)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([foodId, { count, memberIds }]) => ({
      food: allFoods.find((f) => f.id === foodId)!,
      likeCount: count,
      members: memberIds.map((id) => members.find((m) => m.id === id)!).filter(Boolean),
    }))
    .filter((p) => p.food)

  return (
    <ResultsBoard
      matches={matches}
      popular={popular}
      members={members}
      reactions={reactions}
      foods={allFoods}
      currentUserId={user?.id}
      groupCode={params.code}
    />
  )
}
