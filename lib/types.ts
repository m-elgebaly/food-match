export interface Food {
  id: string
  name: string
  image_url: string
  category: string | null
  tags: string[] | null
  created_at: string
}

export interface Reaction {
  id: string
  user_id: string
  food_id: string
  reaction: 'like' | 'dislike' | 'skip'
  source: 'solo' | 'group'
  group_id: string | null   // null for solo reactions
  created_at: string
}

export interface Group {
  id: string
  code: string
  host_user_id: string | null
  status: 'lobby' | 'active' | 'ended'
  mode: 'match_first' | 'time_limit' | 'swipe_limit'
  time_limit_seconds: number | null
  swipe_limit: number | null
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string | null
  display_name: string
  avatar_color: string | null
  is_ready: boolean
  joined_at: string
}

export interface GroupReaction {
  id: string
  group_id: string
  member_id: string
  food_id: string
  reaction: 'like' | 'dislike' | 'skip'
  reacted_at: string
}

export interface GroupMatch {
  id: string
  group_id: string
  food_id: string
  matched_at: string
}

export interface GuestReaction {
  foodId: string
  foodName: string
  foodImage: string
  reaction: 'like' | 'dislike' | 'skip'
}
