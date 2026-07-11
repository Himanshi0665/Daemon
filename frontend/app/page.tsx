import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Daemon — Your AI Email Operating System',
  description:
    'Daemon monitors your Gmail, extracts what matters, and shows you exactly what to do — before deadlines, interviews, and opportunities slip away.',
  openGraph: {
    title: 'Daemon — Your AI Email Operating System',
    description:
      'Turn emails into actions. Never miss a deadline, interview, or opportunity again.',
    type: 'website',
  },
}

/**
 * Landing page — the public root of Daemon.
 *
 * Routing:
 *   Unauthenticated → renders landing page
 *   Authenticated   → server-side redirect to /dashboard
 */
export default async function LandingPage() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
