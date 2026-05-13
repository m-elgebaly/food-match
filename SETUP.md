# Food Match — Setup & Deployment Guide

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
```
Then fill in your Supabase values (see step 3).

### 3. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Paste them into `.env.local`

### 4. Run the database schema
In the Supabase Dashboard → **SQL Editor**, run:
1. `supabase/schema.sql` — creates all tables, RLS policies, and the match trigger
2. `supabase/seed.sql` — adds 37 food items to get started

### 5. Enable Realtime
In Supabase Dashboard → **Database → Replication**, enable the following tables:
- `groups`
- `group_members`
- `group_reactions`
- `group_matches`

### 6. Enable Google OAuth (optional)
In Supabase Dashboard → **Authentication → Providers → Google**:
1. Enable Google provider
2. Add your Google OAuth client ID and secret
3. Add `http://localhost:3000/auth/callback` to allowed redirect URLs

### 7. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/food-match.git
git push -u origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Vercel auto-detects Next.js — no build config needed

### 3. Add environment variables in Vercel
In **Project Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL (e.g. `https://food-match.vercel.app`) |

### 4. Update Supabase redirect URLs
In Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: add `https://your-app.vercel.app/auth/callback`

### 5. Deploy
Click **Deploy** in Vercel — you're live!

---

## Project Structure

```
app/
├── page.tsx                    # Landing page
├── explore/page.tsx            # Solo food explorer (guest + auth)
├── login/page.tsx              # Sign in / sign up
├── profile/page.tsx            # Liked & disliked foods
├── auth/callback/route.ts      # OAuth callback handler
└── group/
    ├── new/page.tsx            # Create group session
    └── [code]/
        ├── page.tsx            # Lobby + active session
        └── results/page.tsx    # Session results

components/
├── shared/   Navbar, AuthForm, GuestPrompt
├── solo/     FoodCard, FoodGrid
└── group/    LobbyRoom, SessionRoom, MatchCelebration,
              SessionTimer, SwipeCounter, ResultsBoard

utils/
├── supabase/client.ts          # Browser Supabase client
├── supabase/server.ts          # Server Supabase client
└── generateCode.ts             # Group code & avatar color utils

supabase/
├── schema.sql                  # Tables, RLS, match trigger
└── seed.sql                    # 37 food items

lib/
└── types.ts                    # TypeScript interfaces
```

---

## Key Features

- **Solo Mode**: Swipe foods, build taste profile, guest mode with 5-swipe limit
- **Group Mode**: Real-time lobby, social signals, match celebration
- **3 Session Modes**: Match First, Time Limit, Swipe Limit
- **Guest Users**: Join groups without an account (display name only)
- **Auth**: Email/password + Google OAuth via Supabase Auth
- **Realtime**: Supabase Realtime for live lobby, reactions, and match events
