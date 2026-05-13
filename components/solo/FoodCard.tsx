'use client'

import Image from 'next/image'
import type { Food } from '@/lib/types'

interface FoodCardProps {
  food: Food
  onReact: (reaction: 'like' | 'dislike' | 'skip') => void
  loading?: boolean
  socialSignals?: Array<{ memberName: string; avatarColor: string }>
}

export default function FoodCard({ food, onReact, loading, socialSignals }: FoodCardProps) {
  return (
    <div className="card overflow-hidden max-w-sm w-full mx-auto animate-fade-in">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-stone-100">
        <Image
          src={food.image_url}
          alt={food.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          quality={70}
          priority
        />
        {/* Category badge */}
        {food.category && (
          <div className="absolute top-3 left-3 badge bg-black/50 text-white backdrop-blur-sm">
            {food.category}
          </div>
        )}
        {/* Social signals */}
        {socialSignals && socialSignals.length > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
            <div className="flex -space-x-1">
              {socialSignals.slice(0, 3).map((s, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: s.avatarColor }}
                  className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                >
                  {s.memberName[0]?.toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-xs font-medium text-stone-700">
              {socialSignals.length === 1
                ? `${socialSignals[0].memberName} likes this`
                : `${socialSignals.length} members like this`}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-stone-900 mb-1">{food.name}</h3>
        {food.tags && food.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {food.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="badge bg-stone-100 text-stone-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onReact('dislike')}
            disabled={loading}
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 transition-all disabled:opacity-50 group"
            title="Dislike"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">👎</span>
            <span className="text-xs font-medium text-red-600">Nope</span>
          </button>
          <button
            onClick={() => onReact('skip')}
            disabled={loading}
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 active:bg-stone-200 border border-stone-200 transition-all disabled:opacity-50 group"
            title="Skip"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">⏭</span>
            <span className="text-xs font-medium text-stone-500">Skip</span>
          </button>
          <button
            onClick={() => onReact('like')}
            disabled={loading}
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl bg-green-50 hover:bg-green-100 active:bg-green-200 border border-green-200 transition-all disabled:opacity-50 group"
            title="Like"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">👍</span>
            <span className="text-xs font-medium text-green-600">Love it</span>
          </button>
        </div>
      </div>
    </div>
  )
}
