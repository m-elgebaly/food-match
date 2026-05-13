'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { generateAvatarColor } from '@/utils/generateCode'
import type { Group, GroupMember } from '@/lib/types'
import LobbyRoom from '@/components/group/LobbyRoom'
import SessionRoom from '@/components/group/SessionRoom'

type Phase = 'loading' | 'join' | 'lobby' | 'session' | 'ended' | 'not-found'

export default function GroupPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [phase, setPhase]               = useState<Phase>('loading')
  const [group, setGroup]               = useState<Group | null>(null)
  const [allMembers, setAllMembers]     = useState<GroupMember[]>([])
  const [currentMember, setCurrentMember] = useState<GroupMember | null>(null)
  const [displayName, setDisplayName]   = useState('')
  const [joining, setJoining]           = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const loadGroup = useCallback(async () => {
    const { data: g } = await supabase
      .from('groups')
      .select('*')
      .eq('code', code)
      .single()

    if (!g) { setPhase('not-found'); return }
    setGroup(g)

    if (g.status === 'ended') {
      router.push(`/group/${code}/results`)
      return
    }

    // Check if already a member (from localStorage or auth)
    const storedMemberId = localStorage.getItem(`groupMember_${code}`)
    const { data: { user } } = await supabase.auth.getUser()

    let member: GroupMember | null = null

    if (storedMemberId) {
      const { data } = await supabase
        .from('group_members')
        .select('*')
        .eq('id', storedMemberId)
        .single()
      member = data
    } else if (user) {
      const { data } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', g.id)
        .eq('user_id', user.id)
        .single()
      member = data
    }

    if (member) {
      setCurrentMember(member)
      // Prefill name for join form if needed
      setDisplayName(member.display_name)
      // Set phase based on group status
      setPhase(g.status === 'active' ? 'session' : 'lobby')
    } else {
      setPhase('join')
    }

    // Load all members
    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', g.id)
    setAllMembers(members ?? [])
  }, [code, router, supabase])

  useEffect(() => { loadGroup() }, [loadGroup])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!group || !displayName.trim()) return
    setJoining(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: member, error: insertError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user?.id ?? null,
          display_name: displayName.trim(),
          avatar_color: generateAvatarColor(),
          is_ready: true,
        })
        .select()
        .single()

      if (insertError) throw insertError

      localStorage.setItem(`groupMember_${code}`, member.id)
      setCurrentMember(member)
      setPhase(group.status === 'active' ? 'session' : 'lobby')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join')
    }
    setJoining(false)
  }

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🍽️</div>
          <p className="text-stone-500">Loading session...</p>
        </div>
      </div>
    )
  }

  if (phase === 'not-found') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Session Not Found</h1>
        <p className="text-stone-500 mb-6">The group code <strong>{code}</strong> doesn&apos;t exist or has expired.</p>
        <a href="/group/new" className="btn-primary">Create a New Session</a>
      </div>
    )
  }

  if (phase === 'join') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="card max-w-sm w-full p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">👋</div>
            <h1 className="text-2xl font-bold text-stone-900">Join Session</h1>
            <p className="text-stone-500 mt-1">
              Code: <strong className="text-stone-800">{code}</strong>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Your Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex"
                maxLength={30}
                required
                className="input"
                autoFocus
              />
            </div>
            <button type="submit" disabled={joining} className="btn-primary w-full">
              {joining ? 'Joining...' : 'Join Session 🎉'}
            </button>
          </form>

          <p className="text-center text-stone-400 text-xs mt-4">
            No account required — guests welcome!
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'lobby' && group && currentMember) {
    return (
      <LobbyRoom
        group={group}
        currentMemberId={currentMember.id}
        isHost={currentMember.user_id === group.host_user_id}
        onSessionStart={() => setPhase('session')}
      />
    )
  }

  if (phase === 'session' && group && currentMember) {
    return (
      <SessionRoom
        group={group}
        currentMember={currentMember}
        isHost={currentMember.user_id === group.host_user_id}
        allMembers={allMembers}
      />
    )
  }

  return null
}
