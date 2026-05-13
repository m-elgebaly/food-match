import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-orange-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🍕</div>
          <div className="absolute top-20 right-20 text-7xl">🍜</div>
          <div className="absolute bottom-20 left-1/4 text-6xl">🍣</div>
          <div className="absolute bottom-10 right-1/3 text-8xl">🌮</div>
          <div className="absolute top-1/2 left-1/2 text-5xl">🍔</div>
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span>🔥</span>
            <span>The food-matching app your friend group needs</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Stop debating.<br />
            <span className="text-yellow-300">Start eating.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Swipe through food you love, build your taste profile, and find the
            perfect dish your whole group agrees on — in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/explore" className="btn-primary bg-white text-brand-600 hover:bg-stone-50 text-lg px-8 py-4">
              Start Exploring 👍
            </Link>
            <Link href="/group/new" className="btn-secondary border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 bg-transparent">
              Create a Group Session
            </Link>
          </div>
          <p className="text-white/60 text-sm mt-6">No account needed to try it out</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-stone-500 text-center mb-14 text-lg max-w-xl mx-auto">
            Two ways to use Food Match, depending on whether you&apos;re flying solo or with friends.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Solo */}
            <div className="card p-8">
              <div className="text-4xl mb-4">🧑‍🍳</div>
              <h3 className="text-xl font-bold mb-2">Solo Mode</h3>
              <p className="text-stone-500 mb-6">Build your personal taste profile by swiping on foods you love, hate, or aren&apos;t sure about yet.</p>
              <ul className="space-y-3 text-stone-700">
                {[
                  "👍 Like foods you enjoy",
                  "👎 Dislike foods you skip",
                  "⏭ Skip if you're not sure",
                  "📊 View your full taste profile",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">{item}</li>
                ))}
              </ul>
              <Link href="/explore" className="btn-primary mt-6 inline-block text-center w-full">
                Explore Foods
              </Link>
            </div>
            {/* Group */}
            <div className="card p-8 border-brand-200 bg-brand-50">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-2">Group Mode</h3>
              <p className="text-stone-500 mb-6">Create a session, invite friends with a link, and swipe together until you find a dish everyone loves.</p>
              <ul className="space-y-3 text-stone-700">
                {[
                  "🔗 Share a short invite link",
                  "👥 Friends join — no account needed",
                  "🃏 Everyone swipes their own feed",
                  "🎊 Celebrate when you match!",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">{item}</li>
                ))}
              </ul>
              <Link href="/group/new" className="btn-primary mt-6 inline-block text-center w-full">
                Create a Group
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Social proof */}
      <section className="py-16 px-6 bg-stone-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { emoji: '🍽️', stat: '200+', label: 'Foods to Discover' },
            { emoji: '⚡', stat: 'Real-time', label: 'Group Sessions' },
            { emoji: '🎯', stat: '3 Modes', label: 'Session Types' },
            { emoji: '🔓', stat: 'Free', label: 'No Account Needed' },
          ].map(({ emoji, stat, label }) => (
            <div key={label}>
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="text-2xl font-black text-brand-600">{stat}</div>
              <div className="text-stone-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-stone-900 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to find your match?</h2>
        <p className="text-stone-400 mb-8 text-lg">Start swiping in seconds. No account required.</p>
        <Link href="/explore" className="btn-primary text-lg px-10 py-4">
          Try It Free 🚀
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-stone-900 border-t border-stone-800 text-center text-stone-500 text-sm">
        Food Match — Built with Next.js & Supabase
      </footer>
    </div>
  )
}
