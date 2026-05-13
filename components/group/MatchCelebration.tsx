'use client'

import Image from 'next/image'
import type { Food } from '@/lib/types'

interface MatchCelebrationProps {
  food: Food
  onDismiss: () => void
  onContinue: () => void
  isHost?: boolean
}

export default function MatchCelebration({ food, onDismiss, onContinue, isHost }: MatchCelebrationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Confetti effect with CSS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top:  `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1}s`,
              animationDuration: `${0.8 + Math.random() * 0.8}s`,
            }}
          >
            {['🎉', '🎊', '✨', '🍽️', '❤️'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div className="card max-w-sm w-full p-8 text-center animate-bounce-in relative z-10">
        <div className="text-5xl mb-2">🎊</div>
        <h2 className="text-3xl font-black text-brand-600 mb-1">It&apos;s a Match!</h2>
        <p className="text-stone-500 mb-6">Everyone in your group loves this dish</p>

        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 shadow-lg">
          <Image
            src={food.image_url}
            alt={food.name}
            fill
            className="object-cover"
          />
        </div>

        <h3 className="text-xl font-bold text-stone-900 mb-1">{food.name}</h3>
        {food.category && (
          <span className="badge bg-stone-100 text-stone-600 mb-4 inline-block">
            {food.category}
          </span>
        )}

        <div className="space-y-3 mt-4">
          <button onClick={onContinue} className="btn-primary w-full">
            Keep Swiping for More 🚀
          </button>
          {isHost && (
            <button onClick={onDismiss} className="btn-secondary w-full">
              End Session & See Results
            </button>
          )}
          {!isHost && (
            <button onClick={onDismiss} className="btn-ghost w-full">
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
