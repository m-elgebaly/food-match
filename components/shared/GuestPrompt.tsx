'use client'

import Link from 'next/link'

interface GuestPromptProps {
  swipesUsed: number
  limit: number
  onDismiss?: () => void
}

export default function GuestPrompt({ swipesUsed, limit, onDismiss }: GuestPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card max-w-sm w-full p-8 text-center animate-scale-up">
        <div className="text-5xl mb-4">🍽️</div>
        <h2 className="text-2xl font-bold mb-2">You&apos;ve used {swipesUsed} free swipes!</h2>
        <p className="text-stone-500 mb-6">
          Create a free account to keep swiping, save your taste profile, and join group sessions.
          Your {swipesUsed} reactions will be saved automatically.
        </p>
        <div className="space-y-3">
          <Link href="/login?tab=signup" className="btn-primary w-full inline-block text-center">
            Create Free Account
          </Link>
          <Link href="/login" className="btn-secondary w-full inline-block text-center">
            Sign In
          </Link>
          {onDismiss && (
            <button onClick={onDismiss} className="btn-ghost w-full text-stone-400 text-sm">
              Continue browsing (read-only)
            </button>
          )}
        </div>
        <p className="text-stone-400 text-xs mt-4">No credit card required · Free forever</p>
      </div>
    </div>
  )
}
