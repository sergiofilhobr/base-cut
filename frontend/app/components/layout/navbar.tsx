'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/app/components/ui/theme-toggle'
import { MobileDrawer } from '@/app/components/layout/mobile-drawer'
import { BOOKSY_URL, NAV_LINKS } from '@/app/lib/constants'

/* Hallmark · nav archetype: N7 Brutal slab · design-system: design.md */

/**
 * Navbar — N7 Brutal slab.
 *
 * Full-width, borda inferior de 2px, wordmark e links em caixa alta tracked.
 * Sem raio, sem sombra, sem `backdrop-blur` e **fora** de `position: fixed` —
 * a barra vive no fluxo do documento. A partir de `sm` os links vivem no
 * próprio header; abaixo disso não sobra largura pra isso sem apertar tudo,
 * então a nav migra para o `MobileDrawer` — um tap de distância, nunca
 * escondida atrás de mais de um nível de navegação.
 */
export function Navbar() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <header id="navbar" className="bg-paper border-b-2 border-ink">
      <div
        className="
          px-6 sm:px-10 py-4
          flex flex-wrap items-center justify-between gap-x-8 gap-y-3
        "
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Base Cut — Início"
            className="
              font-display font-black uppercase tracking-[-0.01em] text-xl text-ink
              hover:opacity-70
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
              focus-visible:outline-ink
              transition-opacity duration-200
            "
          >
            Base<span className="text-muted">Cut</span>
          </Link>
        </div>

        <nav aria-label="Principal" className="hidden sm:block">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {NAV_LINKS.map((link) => {
              const { href, label } = link
              const hoverLabel = 'hoverLabel' in link ? link.hoverLabel : undefined
              const active = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-label={hoverLabel ? label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      group block
                      font-mono text-[11px] uppercase tracking-[0.2em] whitespace-nowrap
                      border-b pb-0.5
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                      focus-visible:outline-ink
                      transition-colors duration-200
                      ${
                        active
                          ? 'text-ink border-ink'
                          : 'text-muted border-transparent hover:text-ink'
                      }
                    `}
                  >
                    {hoverLabel ? (
                      /* Grid empilha as duas palavras na mesma célula: a largura
                         é a da mais larga, então trocar não desloca o layout. */
                      <span aria-hidden="true" className="grid overflow-hidden">
                        <span
                          className="
                            col-start-1 row-start-1
                            transition-transform duration-300 ease-out
                            group-hover:-translate-y-full group-focus-visible:-translate-y-full
                            motion-reduce:transition-none
                          "
                        >
                          {label}
                        </span>
                        <span
                          className="
                            col-start-1 row-start-1 translate-y-full
                            transition-transform duration-300 ease-out
                            group-hover:translate-y-0 group-focus-visible:translate-y-0
                            motion-reduce:transition-none
                          "
                        >
                          {hoverLabel}
                        </span>
                      </span>
                    ) : (
                      label
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            id="navbar-cta"
            href={BOOKSY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              hidden sm:inline-flex
              px-5 py-2.5
              font-mono text-[11px] uppercase tracking-[0.2em] whitespace-nowrap
              bg-ink text-paper
              hover:opacity-90
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
              focus-visible:outline-ink
              transition-opacity duration-200
            "
          >
            Agendar
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={drawerOpen}
            className="
              sm:hidden -mr-1
              w-11 h-11 flex items-center justify-center text-ink
              hover:opacity-70
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-ink
              transition-opacity duration-200
            "
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pathname={pathname}
      />
    </header>
  )
}
