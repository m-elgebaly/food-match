'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Group, GroupMember } from '@/lib/types'

interface LobbyRoomProps {
  group: Group
  currentMemberId: string
  isHost: boolean
  onSessionStart: () => void
}

export default function LobbyRoom({ group, currentMemberId, isHost, onSessionStart }: LobbyRoomProps) {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [ready, setReady] = useState(true)
  const [readyInitialized, setReadyInitialized] = useState(false)
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const shareUrl = typeof window !== 'undefined'
    ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/group/${group.code}`
    : `/group/${group.code}`

  const loadMembers = useCallback(async () => {
    const { data } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', group.id)
      .order('joined_at')
    if (data) {
      setMembers(data)
      // Sync ready state from DB on first load
      if (!readyInitialized) {
        const me = data.find((m) => m.id === currentMemberId)
        if (me) { setReady(me.is_ready); setReadyInitialized(true) }
      }
    }
  }, [group.id, currentMemberId, readyInitialized, supabase])

  useEffect(() => {
    loadMembers()

    const channel = supabase
      .channel(`group:${group.code}:members`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${group.id}` },
        () => loadMembers()
      )
      .subscribe()

    // Also listen for group status changes
    const groupChannel = supabase
      .channel(`group:${group.code}:status`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'groups', filter: `id=eq.${group.id}` },
        (payload) => {
          if (payload.new?.status === 'active') onSessionStart()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(groupChannel)
    }
  }, [group.id, group.code, loadMembers, onSessionStart, supabase])

  async function toggleReady() {
    const newReady = !ready
    setReady(newReady)
    await supabase
      .from('group_members')
      .update({ is_ready: newReady })
      .eq('id', currentMemberId)
  }

  async function startSession() {
    setStarting(true)
    await supabase
      .from('groups')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', group.id)
    setStarting(false)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const readyCount = members.filter((m) => m.is_ready).length
  const canStart = isHost && readyCount >= 2

  const modeLabels: Record<string, string> = {
    match_first:  '🎯 Match First',
    time_limit:   '⏱ Time Limit',
    swipe_limit:  '🃏 Swipe Limit',
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Session info */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-stone-900">Session Lobby</h2>
          <span className="badge bg-brand-100 text-brand-700">{modeLabels[group.mode]}</span>
        </div>
        <div className="text-center py-3">
          <p className="text-sm text-stone-500 mb-1">Room Code</p>
          <p className="text-3xl font-black text-stone-900 tracking-wide">{group.code}</p>
        </div>
        <div className="bg-stone-50 rounded-xl p-3 flex items-center gap-2 mt-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-sm text-stone-600 truncate outline-none"
          />
          <button
            onClick={copyLink}
            className={`btn-primary text-xs py-1.5 px-3 shrink-0 transition-colors ${copied ? 'bg-green-500' : ''}`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900">
            Members ({members.length})
          </h3>
          <span className="text-sm text-stone-500">
            {readyCount}/{members.length} ready
          </span>
        </div>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: member.avatar_color || '#f97316' }}
              >
                {member.display_name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-stone-900 truncate">
                  {member.display_name}
                  {member.id === currentMemberId && (
                    <span className="text-stone-400 font-normal"> (you)</span>
                  )}
                  {member.user_id === group.host_user_id && (
                    <span className="text-brand-600 ml-1 text-xs">Host</span>
                  )}
                </p>
              </div>
              <div className={`text-lg ${member.is_ready ? 'opacity-100' : 'opacity-20'}`}>
                ✅
              </div>
            </div>
          ))}
        </div>

        {members.length < 2 && (
          <p className="text-center text-stone-400 text-sm mt-4">
            Share the link to invite friends — no account needed!
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Ready toggle for non-host (or host too) */}
        <button
          onClick={toggleReady}
          className={`w-full font-semibold py-3 px-6 rounded-xl border transition-all ${
            ready
              ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          {ready ? '✅ Ready! (click to unready)' : 'Mark Yourself Ready'}
        </button>

        {isHost && (
          <button
            onClick={startSession}
            disabled={!canStart || starting}
            className="btn-primary w-full text-base py-4"
          >
            {starting ? 'Starting...' : canStart ? 'Start Session 🚀' : `Waiting for at least 2 members to be ready (${readyCount}/2)`}
          </button>
        )}

        {!isHost && (
          <p className="text-center text-stone-400 text-sm">
            Waiting for the host to start the session...
          </p>
        )}
      </div>
    </div>
  )
}
