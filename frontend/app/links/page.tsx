/* Hallmark · genre: editorial · macrostructure: Index-First
 * design-system: design.md · chrome: própria (sem nav, sem footer)
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { BarberPole } from '@/app/components/ui/barber-pole'
import { ThemeToggle } from '@/app/components/ui/theme-toggle'
import { LinkAgendar } from '@/app/components/ui/link-agendar'
import {
  BARBER_INSTAGRAM_HANDLE,
  BARBER_INSTAGRAM_URL,
  BASE_RUN_WHATSAPP_URL,
  GOOGLE_MAPS_URL,
  GOOGLE_REVIEW_URL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from '@/app/lib/constants'

export const metadata: Metadata = {
  title: 'Links — Base Cut Barbearia',
  description:
    'Agenda, Instagram, Base Run e o caminho até a base. Todos os links da Base Cut num lugar só.',
  openGraph: {
    title: 'Links — Base Cut Barbearia',
    description: 'Todos os links da Base Cut num lugar só.',
    locale: 'pt_BR',
    type: 'website',
  },
}

interface Slab {
  label: string
  meta: string
  href: string
  /** Rota interna do site — usa <Link> e não abre em aba nova. */
  interno?: boolean
}

/**
 * A ordem é a do cliente, e ela mistura de propósito o que é de fora e o que é
 * do site — por isso não há mais divisão "Redes" / "No site". Quem abre a bio
 * quer marcar (o Booksy, acima), ver a casa, ver o preço e saber o caminho,
 * nessa sequência.
 */
const PRINCIPAIS: Slab[] = [
  { label: 'Instagram', meta: INSTAGRAM_HANDLE, href: INSTAGRAM_URL },
  { label: 'Serviços', meta: 'Tabela e preços', href: '/servicos', interno: true },
  { label: 'Como chegar', meta: 'R. Juvenal García, 64', href: GOOGLE_MAPS_URL },
  { label: 'Site', meta: 'basecut.com.br', href: '/', interno: true },
]

/** O resto da casa — abaixo da dobra útil, sem competir com os cinco de cima. */
const TAMBEM: Slab[] = [
  { label: 'Bruno', meta: BARBER_INSTAGRAM_HANDLE, href: BARBER_INSTAGRAM_URL },
  { label: 'Base Run', meta: 'Grupo no WhatsApp', href: BASE_RUN_WHATSAPP_URL },
  { label: 'Google', meta: 'Avaliações', href: GOOGLE_REVIEW_URL },
  { label: 'Run Club', meta: 'Domingo, na base', href: '/run-club', interno: true },
  { label: 'Galeria', meta: 'Cortes e bastidores', href: '/galeria', interno: true },
  { label: 'Contato', meta: 'Mapa e avaliações', href: '/contato', interno: true },
]

/* Régua de estilo do slab: caixa de 2px, sem raio, sem sombra — o mesmo
   material da nav e do footer. O hover carrega um sinal só: a inversão
   tinta/papel, e o `active` é instantâneo.
   A transição nomeia `color` e `background-color` em vez de usar
   `transition-colors`: no Tailwind v4 esse utilitário arrasta `outline-color`
   junto, e o anel de foco tem que aparecer sem transição nenhuma
   (design.md § Microinteractions). */
const SLAB = `
  group flex items-center justify-between gap-6
  min-h-14 px-6 py-4
  border-2 border-ink text-ink
  hover:bg-ink hover:text-paper
  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
  focus-visible:outline-ink
  active:translate-y-px
  transition-[color,background-color] duration-200
`

function SlabContent({ label, meta }: Pick<Slab, 'label' | 'meta'>) {
  return (
    <>
      <span className="font-medium text-[15px] whitespace-nowrap">{label}</span>
      <span className="font-mono text-[11px] opacity-70 truncate">{meta}</span>
    </>
  )
}

/**
 * Uma pilha de slabs. `titulo` é opcional: a lista principal vem direto abaixo
 * do Booksy, sem rótulo — rotular os dois grupos empataria a hierarquia que a
 * ordem acabou de estabelecer. O segundo grupo ganha o rótulo porque precisa
 * dizer que é o resto.
 */
function Grupo({ titulo, itens }: { titulo?: string; itens: Slab[] }) {
  return (
    <section>
      {titulo && (
        <>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            {titulo}
          </h2>
          <hr className="mt-3 mb-5 border-0 h-px bg-rule" />
        </>
      )}

      <nav aria-label={titulo ?? 'Links principais'} className="flex flex-col gap-3">
        {itens.map(({ label, meta, href, interno }) =>
          interno ? (
            <Link key={href} href={href} className={SLAB}>
              <SlabContent label={label} meta={meta} />
            </Link>
          ) : (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={SLAB}
            >
              <SlabContent label={label} meta={meta} />
            </a>
          )
        )}
      </nav>
    </section>
  )
}

/**
 * /links — a árvore de links da bio.
 *
 * Index-First: a página **é** a lista. Sem hero, sem narrativa, sem nav e sem
 * footer (o `SiteChrome` os desliga nesta rota) — quem chega aqui veio de um
 * @ no Instagram com um destino já em mente, e o que ela deve fazer é entregar
 * esse destino num toque.
 *
 * O poste segura a direita do header — o mesmo canto que ocupa na home, e a
 * marca da casa na ausência do wordmark da nav.
 */
export default function LinksPage() {
  return (
    <div className="mx-auto w-full max-w-[26rem] px-6 pt-8 pb-20">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      {/* O poste fica à direita, como na home: lá ele ocupa o canto direito do
          main, aqui o canto direito do header. Mesma aresta, mesma leitura. */}
      <header className="mt-10 flex items-end justify-between gap-5">
        <div>
          <h1 className="font-display font-black uppercase text-3xl tracking-[-0.01em] leading-none text-ink">
            Base<span className="text-muted">Cut</span>
          </h1>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Barbearia · Itajaí SC
          </p>
        </div>
        <BarberPole className="w-5 h-28 shrink-0" />
      </header>

      {/* A ação da casa vem antes das listas: quem abre esta página do
          Instagram normalmente quer marcar horário, não navegar. */}
      <LinkAgendar
        id="links-cta"
        className="
          mt-10 flex items-center justify-center
          min-h-14 px-6 py-4
          bg-ink text-paper
          font-mono text-xs uppercase tracking-[0.2em] whitespace-nowrap
          hover:opacity-90
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
          focus-visible:outline-ink
          active:translate-y-px
          transition-opacity duration-200
        "
      >
        Agendar
      </LinkAgendar>

      <div className="mt-6 flex flex-col gap-12">
        <Grupo itens={PRINCIPAIS} />
        <Grupo titulo="Também" itens={TAMBEM} />
      </div>

      <p className="mt-16 font-mono text-[11px] leading-loose text-muted">
        Base Cut Barbearia, Itajaí — Santa Catarina. © {new Date().getFullYear()}.
      </p>
    </div>
  )
}
