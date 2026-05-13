'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Food, GroupMember, GroupReaction, GroupMatch } from '@/lib/types'

interface ResultsBoardProps {
  matches: Array<GroupMatch & { food: Food }>
  popular: Array<{ food: Food; likeCount: number; members: GroupMember[] }>
  members: GroupMember[]
  reactions: GroupReaction[]
  foods: Food[]
  currentUserId?: string
  groupCode: string
  onSaveMatch?: (foodId: string) => void
}

export default function ResultsBoard({
  matches,
  popular,
  members,
  reactions,
  foods,
  groupCode,
  onSaveMatch,
}: ResultsBoardProps) {
  function getMemberReaction(memberId: string, foodId: string) {
    return reactions.find((r) => r.member_id === memberId && r.food_id === foodId)?.reaction
  }

  const reactionEmoji = { like: '👍', dislike: '👎', skip: '⏭' } as const

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/group/${groupCode}/results`

  async function copyResults() {
    await navigator.clipboard.writeText(shareUrl)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-2">🏆</div>
        <h1 className="text-3xl font-black text-stone-900 mb-1">Session Results</h1>
        <p className="text-stone-500">{members.length} players • {reactions.length} total reactions</p>
        <button onClick={copyResults} className="btn-secondary text-sm mt-3 py-2 px-4">
          Share Results 🔗
        </button>
      </div>

      {/* Matches */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
          <span>🎊</span> Unanimous Matches
        </h2>
        {matches.length === 0 ? (
          <div className="card p-8 text-center text-stone-400">
            <div className="text-4xl mb-2">😔</div>
            <p className="font-medium">No matches this session</p>
            <p className="text-sm mt-1">Try again — maybe better luck next time!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(({ food, id }) => (
              <div key={id} className="card p-4 flex gap-4 border-brand-200 bg-brand-50">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <Image src={food.image_url} alt={food.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-stone-900">{food.name}</h3>
                  {food.category && <p className="text-sm text-stone-500">{food.category}</p>}
                  <div className="flex items-center gap-1 mt-1">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        title={m.display_name}
                        className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: m.avatar_color || '#f97316' }}
                      >
                        {m.display_name[0]?.toUpperCase()}
                      </div>
                    ))}
                    <span className="text-xs text-green-600 font-medium ml-1">Everyone loves it!</span>
                  </div>
                </div>
                {onSaveMatch && (
                  <button
                    onClick={() => onSaveMatch(food.id)}
                    className="btn-secondary text-xs py-1.5 px-3 self-center shrink-0"
                  >
                    Save
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Most Popular */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
          <span>📊</span> Most Popular
        </h2>
        <div className="space-y-3">
          {popular.slice(0, 8).map(({ food, likeCount, members: likers }, idx) => (
            <div key={food.id} className="card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-600 shrink-0 text-sm">
                #{idx + 1}
              </div>
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <Image src={food.image_url} alt={food.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-stone-900 truncate">{food.name}</p>
                <p className="text-xs text-stone-500">{likeCount} like{likeCount !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex -space-x-1 shrink-0">
                {likers.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    title={m.display_name}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: m.avatar_color || '#f97316' }}
                  >
                    {m.display_name[0]?.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Per-member breakdown */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
          <span>👥</span> Who Liked What
        </h2>
        <div className="space-y-4">
          {members.map((member) => {
            const memberLikes = reactions
              .filter((r) => r.member_id === member.id && r.reaction === 'like')
              .map((r) => foods.find((f) => f.id === r.food_id))
              .filter(Boolean) as Food[]

            return (
              <div key={member.id} className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: member.avatar_color || '#f97316' }}
                  >
                    {member.display_name[0]?.toUpperCase()}
                  </div>
                  <span className="font-semibold text-stone-900">{member.display_name}</span>
                  <span className="text-stone-400 text-sm">— {memberLikes.length} likes</span>
                </div>
                {memberLikes.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {memberLikes.map((food) => (
                      <div key={food.id} className="relative w-14 h-14 rounded-lg overflow-hidden">
                        <Image src={food.image_url} alt={food.name} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 text-sm">No likes this session</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <div className="card p-6 text-center space-y-3">
        <p className="font-semibold text-stone-700">Want to remember what you found?</p>
        <Link href="/login?tab=signup" className="btn-primary inline-block">
          Create an Account to Save Your Picks
        </Link>
        <Link href={`/group/${groupCode}`} className="btn-ghost block text-sm">
          Back to Lobby
        </Link>
      </div>
    </div>
  )
}
