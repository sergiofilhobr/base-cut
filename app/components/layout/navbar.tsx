'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/app/components/ui/theme-toggle'
import { BOOKSY_URL, NAV_LINKS } from '@/app/lib/constants'

/**
 * Navbar — Client Component por incluir ThemeToggle (que usa next-themes).
 * Fixo no topo com backdrop-blur e CTA de agendamento.
 */
export function Navbar() {
  const pathname = usePathname()

  return (
    <header
      id="navbar"
      className="
        fixed top-0 left-0 right-0 z-50
        backdrop-blur-md
        bg-paper/80
        border-b border-rule
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
          <span className="text-xl font-black tracking-tight text-ink group-hover:text-ink transition-colors duration-300">
            BASE
          </span>
          <span className="text-xl font-light tracking-widest text-muted ml-[2px]">
            CUT
          </span>
        </Link>

        {/* Rotas */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Principal">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`
                  text-sm tracking-wide whitespace-nowrap
                  transition-colors duration-200
                  ${
                    active
                      ? 'text-ink font-semibold'
                      : 'text-muted hover:text-ink'
                  }
                `}
              >
                {label}
              </Link>
            )
          })}
        </nav>

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
              bg-ink text-paper
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
