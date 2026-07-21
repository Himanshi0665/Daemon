import Link from 'next/link'

/** Realistic Daemon dashboard preview — pure HTML/Tailwind, no images. */
function DashboardPreview() {
  return (
    <div className="mx-auto mt-14 w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-200 shadow-[0_16px_64px_-16px_rgba(0,0,0,0.18)]">
      {/* Browser chrome */}
      <div className="flex h-9 items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
        </div>
        <span className="text-[11px] text-zinc-400">daemon.app/dashboard</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] text-green-600 font-medium">Connected</span>
        </div>
      </div>

      <div className="flex bg-white" style={{ minHeight: '300px' }}>
        {/* Sidebar */}
        <div className="hidden w-44 shrink-0 border-r border-zinc-100 p-3 sm:block">
          <div className="mb-4 flex items-center gap-1.5 px-1">
            <div className="h-3.5 w-3.5 rounded-sm bg-zinc-900" />
            <span className="text-[11px] font-semibold text-zinc-900">Daemon</span>
          </div>
          {[
            { label: 'Dashboard', active: true },
            { label: 'Inbox Intelligence', active: false },
            { label: 'Action Center', active: false },
            { label: 'Timeline', active: false },
            { label: 'Daemon AI', active: false },
          ].map(({ label, active }) => (
            <div
              key={label}
              className={`mb-0.5 rounded px-2 py-1.5 text-[11px] ${
                active
                  ? 'bg-zinc-100 font-medium text-zinc-900'
                  : 'text-zinc-400'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-3 p-4 overflow-hidden">
          {/* Critical today */}
          <div className="flex items-center justify-between gap-3 rounded-md border-l-[3px] border-l-red-500 bg-white border border-zinc-100 px-3 py-2.5">
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-red-500">
                  Critical
                </span>
                <span className="rounded-full bg-red-50 px-1.5 py-px text-[9px] text-red-500">
                  OA
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-900">
                <span className="text-zinc-400">Google — </span>Online Assessment
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-red-500">2h 41m left</p>
            </div>
            <div className="shrink-0 rounded border border-zinc-200 px-2 py-1 text-[10px] text-zinc-600">
              View →
            </div>
          </div>

          {/* 2-col row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Today's focus */}
            <div className="rounded-md border border-zinc-100 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-zinc-900">Today&apos;s Focus</span>
                <span className="text-[9px] text-zinc-400">1/4 done</span>
              </div>
              {[
                { label: 'Amazon OA', tag: 'OA', done: false },
                { label: 'Goldman Form', tag: 'Form', done: false },
                { label: 'Google Meet', tag: 'Meeting', done: false },
                { label: 'MS HR Reply', tag: 'Recruiter', done: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 py-1">
                  <div
                    className={`h-3 w-3 shrink-0 rounded border ${
                      item.done
                        ? 'border-zinc-300 bg-zinc-100'
                        : 'border-zinc-400'
                    }`}
                  />
                  <span
                    className={`flex-1 truncate text-[10px] ${
                      item.done
                        ? 'text-zinc-400 line-through'
                        : 'text-zinc-700'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-[9px] text-zinc-400">{item.tag}</span>
                </div>
              ))}
            </div>

            {/* Inbox intelligence */}
            <div className="rounded-md border border-zinc-100 p-3">
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-zinc-900">
                  Inbox Intelligence
                </span>
              </div>
              {[
                { label: 'Important Emails', value: '7' },
                { label: 'Unread Actionable', value: '4' },
                { label: 'Hidden Promotions', value: '23' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-zinc-50 py-1.5 last:border-0"
                >
                  <span className="text-[10px] text-zinc-500">{row.label}</span>
                  <span className="text-[10px] font-semibold text-zinc-900">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="flex items-start gap-2 rounded-md border border-zinc-100 p-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 mt-0.5">
              <span className="text-[9px]">✦</span>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-zinc-900">Daemon AI</span>
                <span className="rounded-full border border-zinc-200 px-1 py-px text-[9px] text-zinc-400">
                  Daily Brief
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                You have 2 deadlines this week and 1 interview tomorrow. The Goldman
                Sachs form closes in 3 days — submit before 11:59 PM.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="px-6 pb-20 pt-36 scroll-mt-16">
      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-900" />
          AI-powered email intelligence
        </div>

        {/* Heading */}
        <h1 className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight text-zinc-900 md:text-7xl">
          Your AI Email
          <br />
          Operating System
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-zinc-500">
          Daemon monitors your Gmail, extracts what matters, and shows you exactly
          what to do — before deadlines, interviews, and opportunities slip away.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Connect Gmail
            <span aria-hidden>→</span>
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            See How It Works
          </a>
        </div>

        {/* Trust line */}
        <p className="mt-8 text-xs text-zinc-400">
          Read-only Gmail access · No emails stored on our servers · Cancel anytime
        </p>
      </div>

      {/* Dashboard preview */}
      <DashboardPreview />
    </section>
  )
}
