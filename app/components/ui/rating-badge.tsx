'use client'

import { animated, useSpring } from '@react-spring/web'
import { Star } from 'lucide-react'

interface RatingBadgeProps {
  rating: number
  count: number
  href: string
  className?: string
}

/**
 * RatingBadge — a ponte entre o mapa e as avaliações.
 *
 * Fica junto do endereço: quem acabou de achar a casa no mapa já vê a nota
 * real do Google e é puxado para a prova social logo abaixo. A nota conta
 * e as estrelas enchem com uma mola só quando o bloco entra na tela —
 * a mesma entrada única que o resto do sistema usa (design.md § Motion).
 */
export function RatingBadge({ rating, count, href, className = '' }: RatingBadgeProps) {
  const { n, fill } = useSpring({
    from: { n: 0, fill: 0 },
    to: { n: rating, fill: rating / 5 },
    config: { tension: 120, friction: 20 },
  })

  return (
    <a
      href={href}
      className={`
        group inline-flex items-center gap-2
        text-sm text-ink
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
        focus-visible:outline-ink
        ${className}
      `}
    >
      <animated.span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {n.to((v) => v.toFixed(1).replace('.', ','))}
      </animated.span>

      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex gap-px text-rule">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={13} strokeWidth={1.5} fill="currentColor" />
          ))}
        </span>
        <animated.span
          className="absolute inset-0 flex gap-px text-ink overflow-hidden"
          style={{ width: fill.to((v) => `${v * 100}%`) }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={13} strokeWidth={1.5} fill="currentColor" />
          ))}
        </animated.span>
      </span>

      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted group-hover:text-ink transition-colors duration-200">
        {count}+ no Google
      </span>
    </a>
  )
}
