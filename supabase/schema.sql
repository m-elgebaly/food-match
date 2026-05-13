-- ============================================================
-- Food Match — Full Database Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Foods ────────────────────────────────────────────────────
create table if not exists foods (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  image_url   text not null,
  category    text,
  tags        text[],
  created_at  timestamptz default now()
);

-- ── Solo reactions ───────────────────────────────────────────
create table if not exists reactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  food_id    uuid not null references foods(id) on delete cascade,
  reaction   text not null check (reaction in ('like', 'dislike', 'skip')),
  source     text default 'solo' check (source in ('solo', 'group')),
  created_at timestamptz default now(),
  unique(user_id, food_id)
);

-- ── Group sessions ───────────────────────────────────────────
create table if not exists groups (
  id                  uuid primary key default gen_random_uuid(),
  code                text unique not null,
  host_user_id        uuid references auth.users(id),
  status              text default 'lobby'
                        check (status in ('lobby', 'active', 'ended')),
  mode                text default 'match_first'
                        check (mode in ('match_first', 'time_limit', 'swipe_limit')),
  time_limit_seconds  int,
  swipe_limit         int,
  started_at          timestamptz,
  ended_at            timestamptz,
  created_at          timestamptz default now()
);

-- ── Group members ────────────────────────────────────────────
create table if not exists group_members (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references groups(id) on delete cascade,
  user_id      uuid references auth.users(id),
  display_name text not null,
  avatar_color text,
  is_ready     bool default false,
  joined_at    timestamptz default now(),
  unique(group_id, user_id)
);

-- ── Group reactions ──────────────────────────────────────────
create table if not exists group_reactions (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references groups(id) on delete cascade,
  member_id    uuid not null references group_members(id) on delete cascade,
  food_id      uuid not null references foods(id) on delete cascade,
  reaction     text not null check (reaction in ('like', 'dislike', 'skip')),
  reacted_at   timestamptz default now(),
  unique(group_id, member_id, food_id)
);

-- ── Group matches ────────────────────────────────────────────
create table if not exists group_matches (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references groups(id) on delete cascade,
  food_id      uuid not null references foods(id) on delete cascade,
  matched_at   timestamptz default now(),
  unique(group_id, food_id)
);

-- ── Future: tag-weight model ─────────────────────────────────
-- create table user_tag_weights (
--   user_id   uuid references auth.users(id),
--   tag       text,
--   weight    float default 0,
--   primary key (user_id, tag)
-- );


-- ============================================================
-- Row Level Security
-- ============================================================

-- Foods: public read
alter table foods enable row level security;
create policy "Public read foods"
  on foods for select using (true);

-- Reactions: own rows only
alter table reactions enable row level security;
create policy "Own reactions"
  on reactions for all using (auth.uid() = user_id);

-- Groups: readable by everyone; host can update
alter table groups enable row level security;
create policy "Read groups"
  on groups for select using (true);
create policy "Host manages group"
  on groups for update using (auth.uid() = host_user_id);
create policy "Host inserts group"
  on groups for insert with check (auth.uid() = host_user_id);

-- Group members: readable by anyone; anyone can join
alter table group_members enable row level security;
create policy "Read members"
  on group_members for select using (true);
create policy "Insert own membership"
  on group_members for insert with check (true);
create policy "Update own membership"
  on group_members for update using (
    id = (select id from group_members where user_id = auth.uid() and group_id = group_members.group_id limit 1)
    or
    exists (select 1 from group_members where user_id = auth.uid() and group_id = group_members.group_id)
  );

-- Group reactions: readable by anyone; anyone can insert own
alter table group_reactions enable row level security;
create policy "Read group reactions"
  on group_reactions for select using (true);
create policy "Insert own group reaction"
  on group_reactions for insert with check (true);

-- Group matches: public read
alter table group_matches enable row level security;
create policy "Read matches"
  on group_matches for select using (true);
create policy "Insert matches"
  on group_matches for insert with check (true);


-- ============================================================
-- Match Detection Trigger
-- Fires after every group_reactions insert.
-- If all active members have liked the same food → insert match.
-- ============================================================

create or replace function check_for_match()
returns trigger as $$
declare
  total_members int;
  like_count    int;
begin
  select count(*) into total_members
  from group_members
  where group_id = NEW.group_id;

  select count(*) into like_count
  from group_reactions
  where group_id = NEW.group_id
    and food_id  = NEW.food_id
    and reaction = 'like';

  if like_count >= total_members and total_members > 0 then
    insert into group_matches (group_id, food_id)
    values (NEW.group_id, NEW.food_id)
    on conflict do nothing;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists after_group_reaction on group_reactions;
create trigger after_group_reaction
  after insert on group_reactions
  for each row execute function check_for_match();


-- ============================================================
-- Realtime — enable publications for live updates
-- ============================================================

-- Enable realtime on relevant tables
-- Run these in Supabase Dashboard > Database > Replication
-- or uncomment and run here:

-- alter publication supabase_realtime add table group_members;
-- alter publication supabase_realtime add table group_reactions;
-- alter publication supabase_realtime add table group_matches;
-- alter publication supabase_realtime add table groups;
