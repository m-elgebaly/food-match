import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AuthForm from '@/components/shared/AuthForm'

interface LoginPageProps {
  searchParams: { tab?: string; redirectTo?: string }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect(searchParams.redirectTo || '/explore')

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-500 to-orange-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {['🍕', '🍜', '🍣', '🌮', '🍔', '🍱', '🍛', '🥗'].map((e, i) => (
            <span
              key={i}
              className="absolute text-6xl"
              style={{ top: `${(i * 30) % 90}%`, left: `${(i * 35) % 80}%` }}
            >
              {e}
            </span>
          ))}
        </div>
        <div className="relative text-white text-center max-w-sm">
          <div className="text-6xl mb-6">🍽️</div>
          <h2 className="text-3xl font-black mb-4">Join the feast</h2>
          <p className="text-white/80 text-lg">
            Build your taste profile, discover new foods, and find what your group agrees on — all in one place.
          </p>
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-stone-900 mb-1">
              {searchParams.tab === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-stone-500">
              {searchParams.tab === 'signup'
                ? 'Your guest reactions will be saved automatically'
                : 'Sign in to access your taste profile'}
            </p>
          </div>
          <AuthForm
            defaultTab={searchParams.tab === 'signup' ? 'signup' : 'signin'}
            redirectTo={searchParams.redirectTo || '/explore'}
          />
        </div>
      </div>
    </div>
  )
}
