'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/app/components/ui/theme-toggle'
import { useSessao } from '../sessao'
import { Button, cn } from '../ui/button'
import { useEu } from './eu'

/* Hallmark · nav archetype: N7 Brutal slab (variante app) · design-system: design.md
 * O header carrega as seções do app por papel, o estado da sessão e o tema.
 * Abaixo de `sm` os links viram um painel de disclosure sob a barra.
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
    <div className="min-h-dvh flex flex-col bg-paper">
      <header className="border-b-2 border-ink bg-paper">
        <div className="px-6 sm:px-10 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              aria-label="Base Cut — site"
              className="font-display font-black uppercase tracking-[-0.01em] text-xl text-ink hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              Base<span className="text-muted">Cut</span>
            </Link>
            <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.25em] text-muted whitespace-nowrap border-l border-rule pl-4">
              {contexto}
            </span>
          </div>

          <nav aria-label="Seções do app" className="hidden sm:block">
            <ul className="flex items-center gap-x-6">
              {secoes.map(({ href, label }) => (
                <li key={href}>
                  <LinkSecao href={href} ativo={pathname === href}>
                    {label}
                  </LinkSecao>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden lg:inline max-w-48 truncate text-xs text-muted" title={quem ?? undefined}>
              {quem}
            </span>
            <ThemeToggle />
            <Button variant="quiet" size="sm" className="hidden sm:inline-flex -mr-3" onClick={() => void sessao.sair()}>
              Sair
            </Button>
            <button
              type="button"
              onClick={() => setAberto((atual) => !atual)}
              aria-label={aberto ? 'Fechar seções' : 'Abrir seções'}
              aria-expanded={aberto}
              aria-controls="secoes-mobile"
              className="sm:hidden -mr-1 w-11 h-11 flex items-center justify-center text-ink hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {aberto ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div id="secoes-mobile" hidden={!aberto} className="sm:hidden border-t-2 border-ink">
          <nav aria-label="Seções do app" className="px-6 py-4">
            <ul className="flex flex-col">
              {secoes.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setAberto(false)}
                    aria-current={pathname === href ? 'page' : undefined}
                    className={cn(
                      'block py-3 font-display font-black uppercase text-2xl tracking-tight border-b border-rule',
                      pathname === href ? 'text-ink' : 'text-muted',
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="truncate text-xs text-muted">{quem}</span>
              <Button variant="outline" size="sm" onClick={() => void sessao.sair()}>
                Sair
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-rule px-6 sm:px-10 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted flex flex-wrap justify-between gap-2">
        <span>Base Cut · {contexto}</span>
        <Link href="/" className="hover:text-ink">
          Voltar ao site
        </Link>
      </footer>
    </div>
  )
}

function LinkSecao({ href, ativo, children }: { href: string; ativo: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={ativo ? 'page' : undefined}
      className={cn(
        'block font-mono text-[11px] uppercase tracking-[0.2em] whitespace-nowrap border-b pb-0.5',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink',
        'transition-colors duration-200',
        ativo ? 'text-ink border-ink' : 'text-muted border-transparent hover:text-ink',
      )}
    >
      {children}
    </Link>
  )
}

function papelLegivel(papel: string) {
  if (papel === 'admin') return 'Admin'
  if (papel === 'barbeiro') return 'Barbeiro'
  if (papel === 'recepcao') return 'Recepção'
  return 'Equipe'
}
