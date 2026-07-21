import Link from 'next/link'

export function CTASection() {
  return (
    <section
      id="pricing"
      className="py-28 px-6 bg-zinc-950 text-white"
    >
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-6">
          Get Started
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-tight">
          Never miss another
          <br />
          deadline.
        </h2>
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed max-w-md mx-auto">
          For students, job seekers, professionals, and anyone whose inbox holds
          opportunities they can&apos;t afford to miss.
        </p>

        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 bg-white text-zinc-900 px-8 py-3.5 rounded-md text-sm font-semibold hover:bg-zinc-100 transition-colors"
        >
          Get Started Free
          <span aria-hidden>→</span>
        </Link>

        <p className="mt-5 text-xs text-zinc-600">
          Free to start · No credit card required · Connect Gmail in 30 seconds
        </p>
      </div>
    </section>
  )
}
