'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { animated, useReducedMotion, useSpring } from '@react-spring/web'
import { ThemeToggle } from '@/app/components/ui/theme-toggle'
import { BOOKSY_URL, NAV_LINKS } from '@/app/lib/constants'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  pathname: string
}

/**
 * MobileDrawer — a nav em painel, só abaixo de `sm`.
 *
 * Acima de `sm` a nav vive no fluxo do header (N7 Brutal slab, design.md).
 * No mobile ela sai do fluxo e vira este painel: some pouco espaço na tela,
 * mas continua um tap de distância — nunca escondida atrás de mais de um
 * nível de navegação. Desliza da direita com a mola do react-spring (mesmo
 * motion system do Lightbox), fecha com Esc, clique no véu ou navegando.
 */
export function MobileDrawer({ open, onClose, pathname }: MobileDrawerProps) {
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)

  const overlayStyle = useSpring({
    opacity: open ? 1 : 0,
    config: reduce ? { duration: 0 } : { tension: 300, friction: 30 },
  })

  const panelStyle = useSpring({
    x: open ? '0%' : '100%',
    config: reduce ? { duration: 0 } : { tension: 280, friction: 30 },
  })

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <animated.div
      style={{
        ...overlayStyle,
        pointerEvents: open ? 'auto' : 'none',
      }}
      className="fixed inset-0 z-50 bg-ink/60 sm:hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      aria-hidden={!open}
    >
      <animated.div
        ref={panelRef}
        tabIndex={-1}
        style={{ transform: panelStyle.x.to((x) => `translateX(${x})`) }}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="
          absolute inset-y-0 right-0 w-[82%] max-w-xs
          bg-paper border-l-2 border-ink
          flex flex-col
          outline-none
        "
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink">
          <span className="font-display font-black uppercase tracking-[-0.01em] text-xl text-ink">
            Menu
          </span>
          <ThemeToggle />
        </div>

        <nav aria-label="Principal" className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const { href, label } = link
              const active = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      block py-3
                      font-display font-black uppercase text-2xl tracking-tight
                      border-b border-rule
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                      focus-visible:outline-ink
                      transition-colors duration-200
                      ${active ? 'text-ink' : 'text-muted hover:text-ink'}
                    `}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="px-6 py-6 border-t-2 border-ink">
          <Link
            href={BOOKSY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="
              flex items-center justify-center w-full px-8 py-4
              font-mono text-xs uppercase tracking-[0.2em] whitespace-nowrap
              bg-ink text-paper
              hover:opacity-90
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
              focus-visible:outline-ink
              transition-opacity duration-200
            "
          >
            Agendar
          </Link>
        </div>
      </animated.div>
    </animated.div>
  )
}
