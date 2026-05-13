import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/shared/Navbar'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Food Match — Find What Everyone Loves',
  description: 'Swipe on food, build your taste profile, and find dishes your whole group agrees on.',
  openGraph: {
    title: 'Food Match',
    description: 'Find the perfect dish everyone in your group will love.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
