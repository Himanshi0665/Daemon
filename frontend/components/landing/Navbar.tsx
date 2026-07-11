'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Activity, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing', badge: 'Soon' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-[0_1px_0_0_#e4e4e7]' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Activity
            size={17}
            strokeWidth={2}
            className="text-zinc-900"
          />
          <span className="font-semibold text-sm tracking-tight text-zinc-900">
            Daemon
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {link.label}
              {link.badge && (
                <span className="text-[10px] text-zinc-400 border border-zinc-200 rounded-full px-1.5 py-px leading-none">
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-1"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-700 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1.5 text-zinc-700 hover:text-zinc-900"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-5 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm text-zinc-600 hover:text-zinc-900"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
            <Link href="/sign-in" className="text-sm text-zinc-600">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium text-zinc-900"
            >
              Get Started →
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
