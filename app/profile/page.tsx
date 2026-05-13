import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/profile')

  // Get all reactions — multiple per food are possible across sessions.
  // We use the latest reaction per food to determine the current opinion.
  const { data: allReactions } = await supabase
    .from('reactions')
    .select(`*, food:foods(*)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Keep only the most recent reaction per food_id
  const seen = new Set<string>()
  const reactions = (allReactions ?? []).filter((r) => {
    if (seen.has(r.food_id)) return false
    seen.add(r.food_id)
    return true
  })

  return (
    <ProfileClient
      user={{ id: user.id, email: user.email ?? '', displayName: user.user_metadata?.display_name ?? user.email ?? '' }}
      initialReactions={reactions ?? []}
    />
  )
}
