'use client'

import { useEffect, useRef } from 'react'
import { animate, createScope, type Scope } from 'animejs'

/**
 * Geometria das listras.
 *
 * O gradiente é desenhado num ângulo `STRIPE_ANGLE`. Para o loop ser
 * imperceptível, o deslocamento vertical precisa ser exatamente um período
 * do padrão projetado no eixo Y — ou seja `PERIOD / |cos(ângulo)|`.
 * Com 120° o cosseno é 0.5, então o percurso vale o dobro do período.
 */
const STRIPE_ANGLE = 120
const BAND = 11
const PERIOD = BAND * 4
const TRAVEL = PERIOD / Math.abs(Math.cos((STRIPE_ANGLE * Math.PI) / 180))

/** Material do poste — neutros quentes do sistema, fixos (não invertem com o tema). */
const STRIPE_DARK = 'var(--pole-dark)'
const STRIPE_LIGHT = 'var(--pole-light)'
const STRIPE_GRAY = 'var(--pole-mid)'

/** Cilindro metálico das tampas, ponteira e haste. */
const CHROME = 'var(--pole-chrome)'

interface BarberPoleProps {
  /** Classes de posicionamento e tamanho — a altura define o tamanho do poste. */
  className?: string
  /** Multiplicador de velocidade da rotação. 1 = padrão. */
  speed?: number
}

/**
 * Barber Pole — o poste giratório de barbearia, animado com anime.js.
 *
 * A rotação é uma ilusão 2D: uma faixa listrada bem mais alta que o tubo
 * desliza verticalmente dentro de um container com `overflow-hidden`, enquanto
 * um gradiente por cima simula a curvatura do cilindro.
 *
 * Respeita `prefers-reduced-motion` via mediaQueries do escopo do anime.js.
 */
export function BarberPole({ className = '', speed = 1 }: BarberPoleProps) {
  const root = useRef<HTMLDivElement>(null)
  const scope = useRef<Scope | null>(null)

  useEffect(() => {
    scope.current = createScope({
      root,
      mediaQueries: { reduced: '(prefers-reduced-motion: reduce)' },
    }).add((self) => {
      if (self?.matches.reduced) return

      // Rotação contínua das listras.
      animate('[data-stripes]', {
        translateY: [0, -TRAVEL],
        duration: 2800 / speed,
        ease: 'linear',
        loop: true,
      })

      // Respiro do brilho do globo de vidro.
      animate('[data-glow]', {
        opacity: [0.4, 0.85],
        scale: [1, 1.12],
        duration: 2400,
        ease: 'inOutSine',
        alternate: true,
        loop: true,
      })
    })

    return () => scope.current?.revert()
  }, [speed])

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`pointer-events-none flex flex-col items-center select-none ${className}`}
    >
      {/* ── Globo de vidro ── */}
      <div className="relative shrink-0">
        <div
          data-glow
          className="absolute -inset-4 rounded-full bg-[var(--pole-glow)] blur-lg"
          style={{ opacity: 0.4 }}
        />
        <div
          className="relative w-[18px] h-[18px] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 34% 28%, #ffffff 0%, var(--pole-light) 55%, var(--pole-mid) 100%)',
            boxShadow:
              '0 0 14px 3px color-mix(in srgb, var(--pole-glow) 65%, transparent)',
          }}
        />
      </div>

      {/* Haste do globo */}
      <div className="w-[5px] h-1.5 shrink-0" style={{ background: CHROME }} />

      {/* ── Tampa superior ── */}
      <div
        className="w-full h-[10px] shrink-0 rounded-t-[3px]"
        style={{ background: CHROME }}
      />

      {/* ── Tubo listrado ── */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Faixa listrada — bem mais alta que o tubo para nunca revelar as bordas */}
        <div
          data-stripes
          className="absolute left-0 w-full"
          style={{
            top: `-${TRAVEL * 2}px`,
            height: `calc(100% + ${TRAVEL * 4}px)`,
            backgroundImage: `repeating-linear-gradient(
              ${STRIPE_ANGLE}deg,
              ${STRIPE_DARK} 0px ${BAND}px,
              ${STRIPE_LIGHT} ${BAND}px ${BAND * 2}px,
              ${STRIPE_GRAY} ${BAND * 2}px ${BAND * 3}px,
              ${STRIPE_LIGHT} ${BAND * 3}px ${PERIOD}px
            )`,
            willChange: 'transform',
          }}
        />

        {/* Curvatura do cilindro: sombra nas bordas, brilho especular à esquerda */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              90deg,
              rgba(0,0,0,0.55) 0%,
              rgba(0,0,0,0.15) 8%,
              rgba(255,255,255,0.38) 20%,
              rgba(255,255,255,0.05) 38%,
              rgba(0,0,0,0.10) 60%,
              rgba(0,0,0,0.35) 84%,
              rgba(0,0,0,0.60) 100%
            )`,
          }}
        />
      </div>

      {/* ── Tampa inferior ── */}
      <div
        className="w-full h-[10px] shrink-0 rounded-b-[3px]"
        style={{ background: CHROME }}
      />

      {/* Ponteira */}
      <div className="w-[5px] h-1.5 shrink-0" style={{ background: CHROME }} />
      <div
        className="w-[14px] h-[14px] shrink-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 34% 28%, var(--pole-light) 0%, var(--pole-mid) 55%, var(--pole-dark) 100%)',
        }}
      />
    </div>
  )
}
