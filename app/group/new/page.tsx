'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { generateGroupCode, generateAvatarColor } from '@/utils/generateCode'

type SessionMode = 'match_first' | 'time_limit' | 'swipe_limit'

const MODES: Array<{ id: SessionMode; label: string; desc: string; emoji: string }> = [
  { id: 'match_first', emoji: '🎯', label: 'Match First', desc: 'Session ends when all members like the same food (best for quick decisions)' },
  { id: 'time_limit',  emoji: '⏱',  label: 'Time Limit',  desc: 'Everyone swipes for a set number of minutes, then see results' },
  { id: 'swipe_limit', emoji: '🃏', label: 'Swipe Limit', desc: 'Session ends after each member has seen N foods' },
]

export default function CreateGroupPage() {
  const [mode, setMode] = useState<SessionMode>('match_first')
  const [timeLimit, setTimeLimit] = useState(5)
  const [swipeLimit, setSwipeLimit] = useState(20)
  const [hostName, setHostName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirectTo=/group/new')
        return
      }

      // Generate a unique code
      let code = generateGroupCode()
      let attempts = 0
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from('groups')
          .select('id')
          .eq('code', code)
          .single()
        if (!existing) break
        code = generateGroupCode()
        attempts++
      }

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          code,
          host_user_id: user.id,
          status: 'lobby',
          mode,
          time_limit_seconds: mode === 'time_limit' ? timeLimit * 60 : null,
          swipe_limit: mode === 'swipe_limit' ? swipeLimit : null,
        })
        .select()
        .single()

      if (groupError) throw groupError

      // Add the host as a member
      const displayName = hostName.trim() || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Host'
      await supabase.from('group_members').insert({
        group_id: group.id,
        user_id: user.id,
        display_name: displayName,
        avatar_color: generateAvatarColor(),
        is_ready: true,
      })

      // Store member ID for later
      const { data: member } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single()

      if (member) {
        localStorage.setItem(`groupMember_${code}`, member.id)
      }

      router.push(`/group/${code}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create group')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🎉</div>
        <h1 className="text-3xl font-black text-stone-900 mb-1">Create a Group Session</h1>
        <p className="text-stone-500">Choose how your session will work, then share the link</p>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Host display name */}
        <div className="card p-5">
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Your Display Name (optional)
          </label>
          <input
            type="text"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="How should the group see you?"
            maxLength={30}
            className="input"
          />
        </div>

        {/* Mode selection */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-stone-700 mb-3">Session Mode</p>
          <div className="space-y-3">
            {MODES.map((m) => (
              <label
                key={m.id}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === m.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={m.id}
                  checked={mode === m.id}
                  onChange={() => setMode(m.id)}
                  className="mt-0.5 accent-brand-500"
                />
                <div>
                  <div className="font-semibold text-stone-900">
                    {m.emoji} {m.label}
                  </div>
                  <div className="text-sm text-stone-500 mt-0.5">{m.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Mode-specific settings */}
        {mode === 'time_limit' && (
          <div className="card p-5">
            <label className="block text-sm font-semibold text-stone-700 mb-3">
              Session Duration
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={30}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="flex-1 accent-brand-500"
              />
              <span className="font-bold text-lg text-stone-900 w-20 text-right">
                {timeLimit} min
              </span>
            </div>
          </div>
        )}

        {mode === 'swipe_limit' && (
          <div className="card p-5">
            <label className="block text-sm font-semibold text-stone-700 mb-3">
              Swipes Per Person
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={swipeLimit}
                onChange={(e) => setSwipeLimit(Number(e.target.value))}
                className="flex-1 accent-brand-500"
              />
              <span className="font-bold text-lg text-stone-900 w-20 text-right">
                {swipeLimit} foods
              </span>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4">
          {loading ? 'Creating...' : 'Create Session 🚀'}
        </button>
      </form>
    </div>
  )
}
