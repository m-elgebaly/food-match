'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/explore', label: 'Explore' },
    { href: '/group/new', label: 'Create Group' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-stone-900">
          <span className="text-2xl">🍽️</span>
          <span>Food Match</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-medium text-sm transition-colors ${
                pathname === href
                  ? 'text-brand-600'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/profile" className="btn-ghost text-sm">
                My Profile
              </Link>
              <button onClick={signOut} className="btn-secondary text-sm py-2 px-4">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">
                Sign In
              </Link>
              <Link href="/login?tab=signup" className="btn-primary text-sm py-2 px-4">
                Sign Up Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-stone-100 pt-2 mt-2">
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 font-medium">
                  My Profile
                </Link>
                <button onClick={() => { signOut(); setMenuOpen(false) }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 font-medium">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 font-medium">
                  Sign In
                </Link>
                <Link href="/login?tab=signup" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-brand-600 hover:bg-brand-50 font-medium">
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
