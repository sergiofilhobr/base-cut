'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/app/components/ui/theme-toggle'
import { BOOKSY_URL } from '@/app/lib/constants'

/**
 * Navbar — Client Component por incluir ThemeToggle (que usa next-themes).
 * Fixo no topo com backdrop-blur e CTA de agendamento.
 */
export function Navbar() {
  return (
    <header
      id="navbar"
      className="
        fixed top-0 left-0 right-0 z-50
        backdrop-blur-md
        bg-neutral-50/80 dark:bg-[#0a0a0a]/80
        border-b border-neutral-200/60 dark:border-neutral-800/60
        transition-colors duration-300
      "
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-end gap-0 select-none group"
          aria-label="Base Cut – Início"
        >
          <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-[#c9a96e] transition-colors duration-300">
            BASE
          </span>
          <span className="text-xl font-light tracking-widest text-neutral-600 dark:text-neutral-400 ml-[2px]">
            CUT
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            id="navbar-cta"
            href={BOOKSY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              px-5 py-2 rounded-full text-sm font-semibold
              tracking-wide
              bg-neutral-900 text-neutral-50
              dark:bg-neutral-50 dark:text-neutral-900
              hover:opacity-90
              transition-all duration-300
              whitespace-nowrap
            "
          >
            Agendar
          </Link>
        </div>
      </div>
    </header>
  )
}
