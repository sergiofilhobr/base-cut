'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/app/components/ui/theme-toggle'
import { useSessao } from '../sessao'
import { Button, cn } from '../ui/button'
import { useEu } from './eu'

/* Hallmark · nav archetype: N7 Brutal slab (variante app) · design-system: design.md
 * daisyUI: navbar + menu no desktop, drawer abaixo de sm.
 * O header carrega as seções do app por papel, o estado da sessão e o tema.
 * A régua de 2px em tinta é a do design.md — o fio do daisy é 1px.
 */

const SECOES_EQUIPE = [
  { href: '/app', label: 'Hoje' },
  { href: '/app/agenda', label: 'Agenda' },
  { href: '/app/expediente', label: 'Expediente' },
  { href: '/app/casa', label: 'Casa' },
] as const

const SECOES_CLIENTE = [
  { href: '/app', label: 'Horários' },
  { href: '/app/marcar', label: 'Marcar' },
  { href: '/app/ficha', label: 'Ficha' },
] as const

export function Shell({ children }: { children: ReactNode }) {
  const { eu } = useEu()
  const sessao = useSessao()
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)

  const secoes = eu.tipo === 'equipe' ? SECOES_EQUIPE : SECOES_CLIENTE
  const contexto = eu.tipo === 'equipe' ? 'Painel' : 'Sua agenda'
  const quem =
    eu.tipo === 'cliente' ? eu.ficha?.nome ?? eu.email : sessao.nome ?? sessao.email ?? papelLegivel(eu.papel)

  return (
    <div className="drawer min-h-dvh">
      <input
        id="secoes-mobile"
        type="checkbox"
        className="drawer-toggle"
        checked={aberto}
        onChange={(evento) => setAberto(evento.target.checked)}
      />
      <div className="drawer-content flex min-h-dvh flex-col bg-paper">
        <header className="navbar border-b-2 border-ink bg-paper px-2 sm:px-6 min-h-16">
          <div className="navbar-start gap-3 min-w-0">
            <label
              htmlFor="secoes-mobile"
              aria-label="Abrir seções"
              className="btn btn-ghost btn-square sm:hidden shadow-none"
            >
              <Menu size={22} aria-hidden="true" />
            </label>
            <Link
              href="/"
              aria-label="Base Cut — site"
              className="font-display font-black uppercase tracking-[-0.01em] text-xl text-ink hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              Base<span className="text-muted">Cut</span>
            </Link>
            <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.25em] text-muted whitespace-nowrap border-l border-base-300 pl-4">
              {contexto}
            </span>
          </div>

          <nav aria-label="Seções do app" className="navbar-center hidden sm:flex">
            <ul className="menu menu-horizontal px-1">
              {secoes.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={pathname === href ? 'page' : undefined}
                    className={cn(
                      'font-mono text-[11px] uppercase tracking-[0.2em]',
                      pathname === href && 'active',
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar-end gap-2">
            <span className="hidden lg:inline max-w-48 truncate text-xs text-muted" title={quem ?? undefined}>
              {quem}
            </span>
            <ThemeToggle />
            <Button variant="quiet" size="sm" className="hidden sm:inline-flex" onClick={() => void sessao.sair()}>
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-base-300 px-6 sm:px-10 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted flex flex-wrap justify-between gap-2">
          <span>Base Cut · {contexto}</span>
          <Link href="/" className="hover:text-ink">
            Voltar ao site
          </Link>
        </footer>
      </div>

      <div className="drawer-side z-40 sm:hidden">
        <label htmlFor="secoes-mobile" aria-label="Fechar seções" className="drawer-overlay" />
        <div className="bg-paper min-h-full w-72 border-e border-base-300 p-4 flex flex-col">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted px-4 py-2">{contexto}</p>
          <ul className="menu w-full grow">
            {secoes.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setAberto(false)}
                  aria-current={pathname === href ? 'page' : undefined}
                  className={cn(
                    'font-display font-black uppercase text-2xl tracking-tight',
                    pathname === href && 'active',
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 py-3 flex flex-col gap-3">
            <span className="truncate text-xs text-muted">{quem}</span>
            <Button variant="outline" size="sm" className="self-start" onClick={() => void sessao.sair()}>
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function papelLegivel(papel: string) {
  if (papel === 'admin') return 'Admin'
  if (papel === 'barbeiro') return 'Barbeiro'
  if (papel === 'recepcao') return 'Recepção'
  return 'Equipe'
}
