# 🍽️ Food Match — Full Product Vision

> **Stack:** React (App Router) · Supabase (Auth + DB + Realtime) · Tailwind CSS  
> **Concept:** A social food preference app where solo users explore and save food tastes, and groups collaborate in real-time sessions to find a dish everyone agrees on.

---

## 1. Product Overview

Food Match has two distinct but connected experiences:

| Mode | What It Is |
|---|---|
| **Solo Mode** | Browse foods, like/dislike, build a personal taste profile |
| **Group Mode** | Create or join a room, swipe together in real-time, find a dish everyone loves |

Solo mode feeds into Group mode — your individual likes train your profile, and your profile can influence what the group sees. Both modes share the same food catalogue and reaction system.

---

## 2. Core User Stories

### Solo
- As a user, I can browse food cards and like or dislike each one (or skip for later)
- As a user, I can view my liked and disliked foods on my profile
- As a user, I can try the app as a guest before creating an account (5 swipe limit)
- As a user, my past reactions influence food recommendations shown to me over time

### Group
- As a user, I can create a group session and get a short shareable link
- As a user, I can share the link so friends can join without needing an account
- As the group host, I can start the session when everyone is ready
- As a group member, I swipe on foods just like in solo mode
- As a group member, I can see when another member has already liked a food I'm looking at
- As a group member, I can skip a food if I'm undecided
- As a group member, I get a match celebration when everyone in the group likes the same food
- As the host, I can set a time limit or a max swipes limit for the session
- As a group member, I can view the results page showing top picks and full reactions when the session ends

---

## 3. Application Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing / Hero | No |
| `/explore` | Solo food explorer | No (guest: 5 swipes) |
| `/login` | Login & Sign Up | No |
| `/profile` | Personal taste profile | Yes |
| `/group/new` | Create a group session | Yes |
| `/group/[code]` | Group lobby + session room | No (guests can join) |
| `/group/[code]/results` | Session results page | No |

---

## 4. Database Schema

### Core Tables

```sql
-- Food catalogue (seeded, not user-generated in MVP)
create table foods (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  image_url   text not null,
  category    text,
  tags        text[],              -- e.g. ['spicy', 'vegan', 'comfort food']
  created_at  timestamptz default now()
);

-- Per-user food reactions (solo mode + persisted from group)
create table reactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  food_id    uuid not null references foods(id) on delete cascade,
  reaction   text not null check (reaction in ('like', 'dislike', 'skip')),
  source     text default 'solo' check (source in ('solo', 'group')),
  created_at timestamptz default now(),
  unique(user_id, food_id)
);
```

### Group Tables

```sql
-- Group sessions
create table groups (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,          -- short URL code e.g. "snack-tiger-42"
  host_user_id  uuid references auth.users(id),
  status        text default 'lobby'
                  check (status in ('lobby', 'active', 'ended')),
  mode          text default 'match_first'
                  check (mode in ('match_first', 'time_limit', 'swipe_limit')),
  time_limit_seconds  int,                     -- null unless mode = time_limit
  swipe_limit         int,                     -- null unless mode = swipe_limit
  started_at    timestamptz,
  ended_at      timestamptz,
  created_at    timestamptz default now()
);

-- Group members (registered users or guests)
create table group_members (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references groups(id) on delete cascade,
  user_id      uuid references auth.users(id),     -- null if guest
  display_name text not null,                       -- "Alex" or "Guest_7f3a"
  avatar_color text,                                -- random hex for guest avatars
  is_ready     bool default false,
  joined_at    timestamptz default now(),
  unique(group_id, user_id)
);

-- Reactions within a group session
create table group_reactions (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references groups(id) on delete cascade,
  member_id    uuid not null references group_members(id) on delete cascade,
  food_id      uuid not null references foods(id) on delete cascade,
  reaction     text not null check (reaction in ('like', 'dislike', 'skip')),
  reacted_at   timestamptz default now(),
  unique(group_id, member_id, food_id)
);

-- Matched foods (all members liked this food)
create table group_matches (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references groups(id) on delete cascade,
  food_id      uuid not null references foods(id) on delete cascade,
  matched_at   timestamptz default now(),
  unique(group_id, food_id)
);
```

### Row Level Security

```sql
-- foods: public read
alter table foods enable row level security;
create policy "Public read foods" on foods for select using (true);

-- reactions: own rows only
alter table reactions enable row level security;
create policy "Own reactions" on reactions for all using (auth.uid() = user_id);

-- groups: readable by members; editable by host
alter table groups enable row level security;
create policy "Read groups" on groups for select using (true);
create policy "Host manages group" on groups for update using (auth.uid() = host_user_id);

-- group_members: readable by anyone with the group code
alter table group_members enable row level security;
create policy "Read members" on group_members for select using (true);
create policy "Insert own membership" on group_members for insert with check (true);

-- group_reactions: readable by group members
alter table group_reactions enable row level security;
create policy "Read group reactions" on group_reactions for select using (true);
create policy "Insert own group reaction" on group_reactions for insert with check (true);

-- group_matches: public read
alter table group_matches enable row level security;
create policy "Read matches" on group_matches for select using (true);
```

---

## 5. Feature Breakdown

### 5a. Solo Mode

**Explore Page**
- Paginated food cards (image, name, category)
- Like 👍 / Dislike 👎 / Skip ⏭ buttons
- Already-reacted foods are filtered from the feed
- Guest users get 5 swipes stored in localStorage before a sign-up prompt
- On sign-up, guest reactions are migrated to the DB

**Profile Page**
- Two sections: Liked Foods and Disliked Foods
- Each food shown as a card with the option to remove the reaction
- Summary stats (total liked, total disliked)

### 5b. Group Mode

**Creating a Group (`/group/new`)**
- Host sets a display name for the session (optional)
- Host picks session mode:
  - **Match First** — session ends when all members like the same food (or host ends manually)
  - **Time Limit** — session runs for X minutes; results shown at end
  - **Swipe Limit** — session ends after each member has seen X foods
- A short readable code is generated (e.g. `pizza-cloud-88`)
- Full shareable URL: `yourapp.com/group/pizza-cloud-88`

**Lobby (`/group/[code]` — status: lobby)**
- Members join via the link (no account required — guests enter a display name)
- Live member list updates in real-time via Supabase Realtime
- Each member has a "Ready" toggle
- Host sees a "Start Session" button that activates when ≥ 2 members are ready
- Host can kick members (optional, post-MVP)

**Session Room (`/group/[code]` — status: active)**
- Each member sees their own food card feed
- On each card: Like 👍 / Dislike 👎 / Skip ⏭
- **Social Signal:** If another group member has already liked this food, a subtle indicator appears on the card (e.g. "❤️ Alex likes this" or a small avatar cluster)
- **Match Event:** When all members like the same food, a full-screen celebration animation fires for everyone simultaneously, showing the matched dish
- After a match, session can continue to find more matches (host decision) or end
- Live progress bar if time limit mode is active
- Live swipe counter if swipe limit mode is active

**Session End Conditions**
| Mode | Ends When |
|---|---|
| Match First | First unanimous match found, OR host manually ends |
| Time Limit | Timer hits zero, OR host manually ends early |
| Swipe Limit | All members reach the swipe cap |

**Results Page (`/group/[code]/results`)**
- 🏆 Top Matches — foods liked by everyone
- 📊 Most Popular — foods liked by the most members (ranked)
- Full per-member reaction breakdown (who liked what)
- Option to save the matched food to personal likes
- Share results link / screenshot prompt

### 5c. Recommendations (Later Phase)

> This feature is intentionally excluded from the initial build but designed for compatibility.

**How it would work:**
- After a user has ≥ 10 likes, the explore feed starts reordering using a simple scoring model
- Score = weighted sum of: matching tags, matching category, liked-by-similar-users
- In Group mode, the food queue is reordered to prioritise foods likely to appeal to the whole group (intersection of individual taste profiles)
- No external ML needed for v1 — a basic SQL scoring query is sufficient

**Schema addition needed (later):**
```sql
-- Tag-based preference weights per user
create table user_tag_weights (
  user_id   uuid references auth.users(id),
  tag       text,
  weight    float default 0,
  primary key (user_id, tag)
);
```

---

## 6. Realtime Architecture

Group sessions rely on Supabase Realtime for live updates. Three channels per session:

| Channel | Purpose | Broadcast Trigger |
|---|---|---|
| `group:[code]:members` | Member join/ready/leave | INSERT/UPDATE on `group_members` |
| `group:[code]:reactions` | Social signals ("X likes this") | INSERT on `group_reactions` |
| `group:[code]:matches` | Match celebration | INSERT on `group_matches` |

**Match Detection (Server-Side)**
A Supabase Database Function checks for a unanimous like after every `group_reactions` insert:

```sql
create or replace function check_for_match()
returns trigger as $$
declare
  total_members int;
  like_count    int;
begin
  -- Count active members in this group
  select count(*) into total_members
  from group_members where group_id = NEW.group_id;

  -- Count likes for this food
  select count(*) into like_count
  from group_reactions
  where group_id = NEW.group_id
    and food_id  = NEW.food_id
    and reaction = 'like';

  -- If unanimous, insert a match
  if like_count = total_members then
    insert into group_matches (group_id, food_id)
    values (NEW.group_id, NEW.food_id)
    on conflict do nothing;
  end if;

  return NEW;
end;
$$ language plpgsql;

create trigger after_group_reaction
after insert on group_reactions
for each row execute function check_for_match();
```

---

## 7. Short Code Generation

Group codes are human-readable and short (no UUIDs in URLs).

```ts
// utils/generateCode.ts
const adjectives = ['pizza', 'crispy', 'golden', 'spicy', 'saucy', 'smoky'];
const nouns      = ['cloud', 'tiger', 'feast', 'table', 'fork', 'bowl'];

export function generateGroupCode(): string {
  const adj  = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num  = Math.floor(Math.random() * 99) + 1;
  return `${adj}-${noun}-${num}`;    // e.g. "spicy-bowl-47"
}
```

Collision check: before inserting, verify the code doesn't already exist in `groups`.

---

## 8. Guest Users in Groups

Guests (no account) can join a group session. They:
- Enter a display name on the join page
- Get a `group_members` row with `user_id = null` and a generated `avatar_color`
- Have their session tied to a `localStorage` key: `guestMemberId`
- **Cannot** have their group reactions merged into a personal profile (they have none)
- Are prompted to sign up at the results page to save their discovered matches

---

## 9. Component Tree (Full App)

```
app/
├── layout.tsx
├── page.tsx                           # Landing
├── explore/page.tsx                   # Solo explorer
├── login/page.tsx
├── profile/page.tsx                   # Personal taste profile
├── group/
│   ├── new/page.tsx                   # Create session
│   └── [code]/
│       ├── page.tsx                   # Lobby + active session (status-driven)
│       └── results/page.tsx           # Session results

components/
├── solo/
│   ├── FoodCard.tsx                   # Image, name, Like/Dislike/Skip
│   └── FoodGrid.tsx                   # Grid of food cards
├── group/
│   ├── LobbyRoom.tsx                  # Member list, ready toggle, start button
│   ├── SessionRoom.tsx                # Active swiping room
│   ├── MatchCelebration.tsx           # Full-screen match animation
│   ├── SocialSignal.tsx               # "X likes this" badge on food card
│   ├── SessionTimer.tsx               # Countdown for time-limit mode
│   ├── SwipeCounter.tsx               # Progress for swipe-limit mode
│   └── ResultsBoard.tsx               # End-of-session results
├── shared/
│   ├── Navbar.tsx
│   ├── AuthForm.tsx
│   └── GuestPrompt.tsx
```

---

## 10. Build Phases

### Phase 1 — Solo MVP ✅ (from prior plan)
- Auth (Google + email/password)
- Guest mode (5 swipes, localStorage, migration on sign-up)
- Explore page (solo swiping)
- Profile page (liked / disliked grids)

### Phase 2 — Group Core
- [ ] Group creation page with mode selection
- [ ] Short code generation + shareable URL
- [ ] Lobby: join by link, display name entry for guests, member list, ready toggle
- [ ] Host: start session control
- [ ] Session room: food swiping per member (same card logic as solo)
- [ ] Group reactions stored in `group_reactions`
- [ ] Match detection trigger in Supabase
- [ ] Realtime: match celebration fires for all members simultaneously
- [ ] Session end logic for all three modes
- [ ] Basic results page (top matches, member reactions)

### Phase 3 — Social Signals & Polish
- [ ] "X likes this" social indicator on food cards during group session
- [ ] Skip option across solo + group
- [ ] Save group match to personal profile reactions
- [ ] Results page: shareable link / screenshot prompt
- [ ] Host: manual end session + kick member

### Phase 4 — Recommendations
- [ ] Tag-weight model per user (built from past likes)
- [ ] Solo explore feed reordered by personal weights
- [ ] Group food queue reordered by group-wide compatibility score
- [ ] Continuous refinement as user swipes more

---

## 11. Full Prompt for AI Coding Assistant

Use the block below to brief an AI assistant on the entire application vision:

---

> I'm building a food preference and group matching web app using **React (App Router)**, **Supabase** (Auth, Postgres, Realtime), and **Tailwind CSS**.
>
> ---
>
> **SOLO MODE**
>
> Users browse a feed of food cards and Like 👍, Dislike 👎, or Skip ⏭ each one. Reactions are stored in a `reactions` table in Supabase. Users can view their full taste profile on a Profile page, split into Liked and Disliked sections.
>
> Unauthenticated guests can try the app first — they get 5 swipes stored in `localStorage`. After 5 swipes, they see a prompt to create an account. On sign-up, their localStorage reactions are migrated to the DB.
>
> ---
>
> **GROUP MODE**
>
> A logged-in user creates a group session and chooses a session mode:
> - **Match First** — ends on first food all members like
> - **Time Limit** — runs for a set number of minutes, then shows results
> - **Swipe Limit** — ends after each member has seen N foods
>
> A short human-readable code is generated (e.g. `spicy-bowl-47`) and turned into a shareable URL: `yourapp.com/group/spicy-bowl-47`.
>
> **Lobby:** Members join via the link. Guests (no account) enter a display name. Members toggle "Ready". The host sees a "Start Session" button. Member presence updates in real-time via Supabase Realtime.
>
> **Session Room:** Each member swipes their own food feed independently. If another group member has already liked a food you're looking at, a subtle social signal shows on the card ("❤️ Alex likes this"). When ALL members have liked the same food, a match is detected server-side via a Supabase trigger, which inserts into `group_matches` and broadcasts a real-time match event to all members, triggering a full-screen celebration animation.
>
> **Results Page:** Shows matched foods, most popular foods ranked by likes, and a per-member breakdown of who liked what.
>
> ---
>
> **DATABASE TABLES:**
> - `foods` — id, name, image_url, category, tags[], created_at
> - `reactions` — id, user_id, food_id, reaction ('like'|'dislike'|'skip'), source ('solo'|'group'), created_at. Unique on (user_id, food_id).
> - `groups` — id, code (unique short string), host_user_id, status ('lobby'|'active'|'ended'), mode, time_limit_seconds, swipe_limit, started_at, ended_at
> - `group_members` — id, group_id, user_id (nullable for guests), display_name, avatar_color, is_ready, joined_at
> - `group_reactions` — id, group_id, member_id, food_id, reaction, reacted_at. Unique on (group_id, member_id, food_id).
> - `group_matches` — id, group_id, food_id, matched_at. Unique on (group_id, food_id).
>
> A Supabase Postgres trigger on `group_reactions` insert checks if all active members have liked the same food and, if so, inserts into `group_matches`.
>
> All tables have RLS enabled. Foods are publicly readable. Reactions and group data are readable by anyone with the group code; only the host can modify group status.
>
> ---
>
> **REALTIME:**
> Three Supabase Realtime channels per group session:
> - `group:[code]:members` — member join, ready toggle, leave
> - `group:[code]:reactions` — social signal ("X likes this food")
> - `group:[code]:matches` — match event triggering celebration
>
> ---
>
> **BUILD PHASES:**
> 1. Solo MVP (auth, explore, profile, guest mode)
> 2. Group core (create, lobby, session, match detection, results)
> 3. Social signals + polish (skip, indicators, save match to profile)
> 4. Recommendations (tag-weight model, personalised feed ordering)
>
> Start with Phase 1. Build incrementally and keep each phase independently testable.

---

*End of Full Product Vision*
