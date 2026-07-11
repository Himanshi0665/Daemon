import Link from 'next/link'
import { Activity } from 'lucide-react'

const currentYear = new Date().getFullYear()

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Sign In', href: '/sign-in' },
  { label: 'Get Started', href: '/sign-up' },
]

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Activity size={15} strokeWidth={2} className="text-zinc-500" />
          <span className="text-sm font-semibold text-zinc-300">Daemon</span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-6 flex-wrap justify-center">
          {links.map((link) => (
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-xs text-zinc-600">
          © {currentYear} Daemon
        </p>
      </div>
    </footer>
  )
}
