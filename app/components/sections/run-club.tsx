'use client'

import type { ReactNode } from 'react'
import { animated, useReducedMotion, useSpring } from '@react-spring/web'
import { Carousel, useCarouselActive } from '@/app/components/ui/carousel'
import { SMOOTH_CONFIG } from '@/app/lib/motion'

/**
 * Link do grupo de WhatsApp do Base Run Club.
 * Substituir pelo link real antes de publicar.
 */
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Drn8xiZJRrM5LLQKLo85ZC'

const PACE = [
  { label: 'Distância', value: '3 – 5 km' },
  { label: 'Ritmo', value: 'Leve, sem pressão' },
  { label: 'Encontro', value: 'Domingo, na Base' },
]

const STEPS = [
  'Apareça domingo na Base Cut',
  'Entre no grupo do WhatsApp',
  'Convide um amigo',
]

/**
 * Capítulo do deck. Sabe seu próprio índice e compara com o índice ativo do
 * Carousel (via contexto): o capítulo em foco sobe e ganha opacidade cheia,
 * os vizinhos ficam discretamente recuados — a mesma mola do resto do
 * sistema, aqui reagindo à navegação em vez do scroll.
 */
function Chapter({
  index,
  label,
  children,
  className = '',
}: {
  index: number
  label: string
  children: ReactNode
  className?: string
}) {
  const active = useCarouselActive()
  const reduce = useReducedMotion()
  const isActive = active === index

  const style = useSpring({
    opacity: isActive ? 1 : 0.35,
    y: isActive ? 0 : 16,
    config: reduce ? { duration: 200 } : SMOOTH_CONFIG,
  })

  return (
    <section
      /* w-full + justify-center: o slide é esticado até a altura do mais alto,
         então centralizamos o conteúdo para a folga se dividir em cima e embaixo
         em vez de despencar tudo abaixo do texto. */
      className={`w-full flex flex-col justify-center px-6 sm:px-10 py-6 sm:py-8 ${className}`}
    >
      <animated.div style={style} className="max-w-4xl w-full mx-auto">
        {/* Eyebrow em mono; o título vem embaixo, na mesma coluna. */}
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--ink)] mb-5 sm:mb-6">
          {label}
        </p>
        {children}
      </animated.div>
    </section>
  )
}

/** Título de capítulo: grotesk pesado, caixa alta, entrelinha travada. */
function Display({ children }: { children: ReactNode }) {
  return (
    <h2
      className="
        font-display font-black uppercase
        text-[2.75rem] sm:text-6xl md:text-7xl
        leading-[0.88] tracking-[-0.02em]
        text-[var(--ink)]
      "
      style={{ overflowWrap: 'anywhere' }}
    >
      {children}
    </h2>
  )
}

/**
 * Reel do Base Run no lugar da "foto do grupo". Vertical (9:16), como os
 * vídeos de celular — nada de faixa horizontal cortando o conteúdo. No
 * desktop fica numa coluna ao lado da régua de dados; no mobile, um cartão
 * retrato centralizado. Respeita `prefers-reduced-motion`: pôster estático
 * em vez de autoplay.
 */
function RunReel() {
  const reduce = useReducedMotion()
  return (
    <figure>
      <div className="mx-auto w-48 sm:w-full aspect-[9/16] border border-[var(--rule)] overflow-hidden">
        {reduce ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/assets/videos/base-run-01.jpg"
            alt="Base Run — corrida de domingo saindo da Base Cut"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src="/assets/videos/base-run-01.mp4"
            poster="/assets/videos/base-run-01.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <figcaption className="sr-only">Base Run — primeira edição.</figcaption>
    </figure>
  )
}

/**
 * Base Run — deck de 5 capítulos.
 * Client Component: cada capítulo anima com a mola do react-spring conforme
 * ganha ou perde foco no carrossel (design.md § Motion — exceção declarada,
 * como a cascata de /contato e /galeria).
 */
export function RunClub() {
  return (
    <div
      id="run-club"
      className="bg-[var(--paper)] text-[var(--ink)]"
    >
      <Carousel label="Base Run — capítulos">
      {/* 01 — Abertura */}
      <Chapter index={0} label="Base Run">
        <Display>
          Corrida,
          <br />
          <span className="text-[var(--muted)]">resenha</span>
          <br />e constância.
        </Display>
        <hr className="my-6 border-0 h-px bg-[var(--muted)]/40" />
        <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[var(--ink)]/80">
          Muito mais que um corte — um jeito de ocupar o domingo. O ponto de
          encontro é a nossa base.
        </p>
      </Chapter>

      {/* 02 — A proposta */}
      <Chapter index={1} label="A Proposta">
        <Display>
          Não é sobre{' '}
          <span className="text-[var(--muted)]">performance.</span> É
          sobre a experiência.
        </Display>
        <hr className="my-6 border-0 h-px bg-[var(--muted)]/40" />
        <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[var(--ink)]/80">
          A ideia é viver a experiência, sair da rotina, conhecer novas pessoas e
          criar constância juntos. Não é sobre pace ou competição — cada um no
          seu ritmo.
        </p>
      </Chapter>

      {/* 03 — Cada um no seu ritmo */}
      <Chapter index={2} label="Cada um no seu ritmo">
        <Display>Cada um no seu ritmo</Display>

        <div className="mt-6 grid gap-6 sm:grid-cols-[200px_1fr] sm:gap-10 sm:items-center">
          <RunReel />

          <dl className="divide-y divide-[var(--muted)]/30 border-y border-[var(--muted)]/30">
            {PACE.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-6 py-4"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
                  {label}
                </dt>
                <dd className="text-base sm:text-lg text-[var(--ink)] text-right">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Chapter>

      {/* 04 — O benefício */}
      <Chapter index={3} label="Quem corre, corta">
        <Display>
          Correu com a gente?{' '}
          <span className="text-[var(--muted)]">10% off</span> no
          corte.
        </Display>
        <hr className="my-6 border-0 h-px bg-[var(--muted)]/40" />
        <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[var(--ink)]/80">
          Vale para todos os cortes, em qualquer dia da semana. Basta ter estado
          na corrida de domingo.
        </p>
      </Chapter>

      {/* 05 — Entrar */}
      <Chapter index={4} label="Vamos construir juntos">
        <Display>
          Quem participar
          <br />
          já faz parte
        </Display>

        <ol className="mt-6 space-y-3">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-baseline gap-5">
              <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--muted)] shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-base sm:text-lg text-[var(--ink)]">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <a
          id="run-club-whatsapp-cta"
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-6 inline-flex items-center gap-3
            px-8 py-4
            font-mono text-xs uppercase tracking-[0.2em] whitespace-nowrap
            bg-[var(--ink)] text-[var(--paper)]
            hover:opacity-90
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
            focus-visible:outline-[var(--ink)]
            transition-opacity duration-200
          "
        >
          Entrar no grupo
        </a>
      </Chapter>
      </Carousel>
    </div>
  )
}
