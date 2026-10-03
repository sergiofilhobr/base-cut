'use client'

import Link from 'next/link'
import { animated, useReducedMotion, useSpring, useTrail } from '@react-spring/web'
import { BarberPole } from '@/app/components/ui/barber-pole'
import { BOOKSY_URL } from '@/app/lib/constants'
import { SMOOTH_CONFIG } from '@/app/lib/motion'

const DATA_ROWS = [
  ['Onde', 'Itajaí — SC'],
  ['Rua', 'Juvenal García, 64'],
  ['Agenda', 'Booksy'],
  ['Base Run', 'Domingos'],
] as const

/* Hallmark · genre: editorial · macrostructure: Marquee Hero
 * design-system: design.md · designed-as-app
 * nav: N7 brutal slab · footer: Ft4 dense colophon
 */

/**
 * Hero — Marquee Hero.
 *
 * O enunciado ocupa a dobra sozinho, alinhado à esquerda. Não há eyebrow, não há
 * subtítulo centralizado. Abaixo da dobra a página muda de forma: vira uma
 * régua de dados em mono. `min-h-dvh` garante que o rodapé não apareça sem
 * rolar — o CTA (`mt-auto`) fica ancorado embaixo da viewport.
 *
 * Esta é a única entrada animada do site inteiro (design.md § Motion).
 */
export function Hero() {
  const reduce = useReducedMotion()

  /* Entrada orquestrada em três tempos — título, régua de dados em
     cascata, CTA por último. A única animação do site inteiro (design.md
     § Motion), então ela carrega o peso de dar vida à chegada na home. */
  const rise = useSpring(
    reduce
      ? { from: { opacity: 0 }, to: { opacity: 1 } }
      : {
          from: { opacity: 0, y: 20 },
          to: { opacity: 1, y: 0 },
          config: { tension: 200, friction: 24 },
        },
  )

  const gridTrail = useTrail(DATA_ROWS.length, {
    from: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    to: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    delay: reduce ? 0 : 280,
    config: SMOOTH_CONFIG,
  })

  const cta = useSpring({
    from: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    to: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    delay: reduce ? 0 : 620,
    config: SMOOTH_CONFIG,
  })

  return (
    <section id="hero" className="relative bg-paper overflow-hidden min-h-dvh flex flex-col">
      <div className="px-6 sm:px-10 pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="max-w-6xl">
          <animated.h1
            style={{ ...rise, overflowWrap: 'anywhere' }}
            className="
              font-display font-black uppercase text-ink
              text-[3.25rem] sm:text-8xl md:text-9xl
              leading-[0.86] tracking-[-0.03em]
            "
          >
            Precisão
            <br />
            <span className="text-muted">é a base.</span>
          </animated.h1>
        </div>

        {/* O poste grande é exclusivo da home — nas outras rotas ele vai ao header. */}
        <BarberPole className="hidden lg:flex absolute right-10 xl:right-16 top-28 w-10 h-64" />
      </div>

      {/* Abaixo da dobra o hero vira uma régua de dados — muda de forma.
          max-w trava as células em telas muito largas (2560px+): sem isso
          cada uma vira um vazio com um rótulo perdido no meio. */}
      <div className="border-t-2 border-ink">
        <dl className="max-w-[1600px] grid grid-cols-2 md:grid-cols-4">
          {gridTrail.map((style, i) => {
            const [label, value] = DATA_ROWS[i]
            return (
              <animated.div
                key={label}
                style={style}
                className="px-6 sm:px-10 py-6 border-b md:border-b-0 border-r last:border-r-0 border-rule"
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                  {label}
                </dt>
                <dd className="mt-2 text-sm sm:text-base text-ink">{value}</dd>
              </animated.div>
            )
          })}
        </dl>
      </div>

      {/* CTA fora da dobra, como manda o Marquee Hero. mt-auto: ancora o CTA
          embaixo do min-h-dvh, então o vão extra fica entre a régua de dados
          e o CTA, não como um buraco solto no fim da página. */}
      <div className="mt-auto border-t-2 border-ink px-6 sm:px-10 py-10">
        <animated.div style={cta} className="inline-block">
          <Link
            id="hero-cta"
            href={BOOKSY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-3 px-8 py-4
              font-mono text-xs uppercase tracking-[0.2em] whitespace-nowrap
              bg-ink text-paper
              hover:opacity-90
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
              focus-visible:outline-ink
              transition-opacity duration-200
            "
          >
            Agendar horário
          </Link>
        </animated.div>
      </div>
    </section>
  )
}
