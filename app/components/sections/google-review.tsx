'use client'

/* Hallmark · genre: editorial · macrostructure: Catalogue
 * design-system: design.md · designed-as-app
 */

import { useState } from 'react'
import { animated, useInView, useReducedMotion, useTrail } from '@react-spring/web'
import { SMOOTH_CONFIG } from '@/app/lib/motion'
import { GOOGLE_MAPS_URL, GOOGLE_REVIEW_URL } from '@/app/lib/constants'
import { REVIEWS } from '@/app/lib/reviews'

/** Quantas avaliações aparecem antes do "ver mais" — o resto é revelado sob pedido. */
const VISIBLE_COUNT = 3

/** Estrelas em tinta — a paleta não tem dourado, o brilho fica por conta do peso. */
function Stars({ n }: { n: number }) {
  return (
    <p role="img" aria-label={`${n} de 5 estrelas`} className="text-sm text-ink">
      <span aria-hidden="true" className="tracking-[0.25em]">
        {'★'.repeat(n)}
      </span>
    </p>
  )
}

/**
 * GoogleReview — o que os Base Members dizem da casa + convite para avaliar.
 *
 * Vive na coluna direita de /contato, ao lado do mapa. Só as três primeiras
 * avaliações entram na dobra — o resto fica atrás de "ver mais avaliações",
 * pra não transformar a página inteira num scroll só de citações.
 *
 * As estrelas vêm em tinta, nunca em dourado: a paleta não tem acento
 * cromático. O link "Ver todas" abre a ficha real no Google Maps, onde a
 * nota é auditável.
 *
 * A lista entra em cascata ao cruzar a dobra — exceção declarada à regra de
 * "uma entrada animada só" (design.md § Motion). Com `prefers-reduced-motion`
 * a cascata colapsa para opacidade em 150ms.
 */
export function GoogleReview() {
  const reduce = useReducedMotion()
  const [ref, inView] = useInView({ once: true, amount: 0.2 })
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? REVIEWS : REVIEWS.slice(0, VISIBLE_COUNT)
  const hiddenCount = REVIEWS.length - VISIBLE_COUNT

  const from = reduce ? { opacity: 0 } : { opacity: 0, y: 32 }
  const to = reduce ? { opacity: 1 } : { opacity: 1, y: 0 }

  const trail = useTrail(visible.length, {
    from,
    to: inView ? to : from,
    config: reduce ? { duration: 150 } : SMOOTH_CONFIG,
  })

  return (
    <div id="avaliacao">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <h2
          className="
            font-display font-black uppercase text-ink
            text-2xl sm:text-3xl
            tracking-tight
          "
        >
          Sua satisfação <span className="text-muted">é a nossa base.</span>
        </h2>

        <a
          id="google-review-card"
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            shrink-0 inline-flex items-center px-8 py-4
            font-mono text-xs uppercase tracking-[0.2em] whitespace-nowrap
            bg-ink text-paper
            hover:opacity-90
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
            focus-visible:outline-ink
            transition-opacity duration-200
          "
        >
          Avaliar no Google
        </a>
      </div>

      <div ref={ref} className="mt-6 divide-y divide-rule border-y border-rule">
        {REVIEWS.length > 0
          ? trail.map((style, i) => {
              const { quote, author, stars } = visible[i]
              return (
                <animated.figure key={author} className="py-4" style={style}>
                  <Stars n={stars} />
                  <blockquote className="mt-2 text-sm sm:text-base leading-relaxed text-ink">
                    “{quote}”
                  </blockquote>
                  <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {author} — Base Member
                  </figcaption>
                </animated.figure>
              )
            })
          : [1, 2, 3].map((n) => (
              <div key={n} className="py-4">
                {/* Slot de avaliação — colar a citação real em REVIEWS */}
                <div className="border border-dashed border-muted/50 px-6 py-8 flex items-center justify-center">
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                    Avaliação {String(n).padStart(2, '0')} — a inserir
                  </span>
                </div>
              </div>
            ))}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="
              text-sm text-ink
              border-b border-ink pb-0.5
              hover:opacity-70
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
              focus-visible:outline-ink
              transition-opacity duration-200
            "
          >
            {expanded ? 'Ver menos' : `Ver mais avaliações (+${hiddenCount})`}
          </button>
        )}

        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            text-sm text-ink
            border-b border-ink pb-0.5
            hover:opacity-70
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
            focus-visible:outline-ink
            transition-opacity duration-200
          "
        >
          Ver todas no Google
        </a>
      </div>

      <p className="mt-6 text-sm sm:text-base leading-relaxed text-muted">
        Cortou com a gente? Conta como foi — é o que ajuda quem ainda não
        conhece a casa a decidir.
      </p>
    </div>
  )
}
