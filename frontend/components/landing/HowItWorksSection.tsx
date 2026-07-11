const steps = [
  {
    number: '01',
    title: 'Connect Gmail',
    description:
      'One-click Google OAuth. Daemon gets read-only access to your inbox. Your emails never leave your account.',
  },
  {
    number: '02',
    title: 'Daemon scans emails',
    description:
      'Daemon runs silently in the background, scanning new emails every 30 minutes. No manual action needed.',
  },
  {
    number: '03',
    title: 'AI extracts important actions',
    description:
      'Gemini AI classifies every email — interview, deadline, meeting, recruiter, or form — with a confidence score.',
  },
  {
    number: '04',
    title: 'Dashboard shows only what matters',
    description:
      "No more digging through 200 emails. Your dashboard shows exactly what needs attention today.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="max-w-xl mb-16">
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium mb-3">
            How It Works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-4">
            From inbox chaos to clear priorities
          </h2>
          <p className="text-zinc-500 leading-relaxed">
            Four steps. No configuration needed. Works immediately after
            connecting Gmail.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(100%+20px)] right-[-20px] h-px bg-zinc-200" />
              )}

              <p className="text-4xl font-bold text-zinc-100 font-mono mb-5 select-none">
                {step.number}
              </p>
              <h3 className="font-semibold text-zinc-900 mb-2 text-sm">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
