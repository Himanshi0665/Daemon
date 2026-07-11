import {
  Clock,
  User,
  CalendarDays,
  CheckSquare,
  Bell,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: Clock,
    title: 'AI Deadline Detection',
    description:
      'Daemon finds hidden deadlines buried in email threads and surfaces them days before they hit.',
  },
  {
    icon: User,
    title: 'Recruiter Prioritization',
    description:
      'Every recruiter email is classified and ranked by urgency. No opportunity gets lost in the noise.',
  },
  {
    icon: CalendarDays,
    title: 'Meeting Timeline',
    description:
      'Interview dates, meeting links, and deadlines laid out on one clean, chronological timeline.',
  },
  {
    icon: CheckSquare,
    title: 'Action Center',
    description:
      'Emails that require action become tasks automatically. No more manually managing to-do lists.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Alerts only when something genuinely needs your attention — not for every promotional email.',
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    description:
      'Ask Daemon anything about your inbox. Every answer is grounded in your actual emails.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-zinc-50 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="max-w-xl mb-16">
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium mb-3">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-4">
            Everything your inbox should have told you
          </h2>
          <p className="text-zinc-500 leading-relaxed">
            Six layers of intelligence that turn a chaotic inbox into a clear
            daily action plan.
          </p>
        </div>

        {/* Feature grid — gap-px + bg-zinc-200 creates clean dividing lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200 rounded-xl overflow-hidden">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 hover:bg-zinc-50 transition-colors duration-150"
            >
              <feature.icon
                size={18}
                className="text-zinc-900 mb-4"
                strokeWidth={1.75}
              />
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
