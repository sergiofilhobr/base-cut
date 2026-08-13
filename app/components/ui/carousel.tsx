'use client'

import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { motion, useMotionValue, useReducedMotion, type PanInfo } from 'framer-motion'

/**
 * Carousel — adaptado de reactbits.dev/components/carousel.
 *
 * Mudanças em relação ao original:
 * · importa de `framer-motion` (já no projeto) em vez de `motion/react`;
 * · largura responsiva medida por ResizeObserver, não `baseWidth` fixo em px;
 * · aceita slides arbitrários como children, em vez do card título/descrição/ícone;
 * · cores vêm dos tokens do sistema;
 * · autoplay não existe — avanço é sempre manual (WCAG 2.2.2);
 * · navegação por teclado (setas, Home/End) e ARIA de carrossel.
 */

const VELOCITY_THRESHOLD = 400
const DRAG_BUFFER = 40
const SPRING = { type: 'spring' as const, stiffness: 300, damping: 34 }

interface CarouselProps {
  children: ReactNode
  /** Rótulo acessível da região do carrossel. */
  label: string
}

export function Carousel({ children, label }: CarouselProps) {
  const slides = Children.toArray(children)
  const count = slides.length

  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [index, setIndex] = useState(0)
  const x = useMotionValue(0)
  const reduceMotion = useReducedMotion()

  /* Mede a largura real do container — um slide por vez, ocupando tudo. */
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const goTo = useCallback(
    (next: number) => setIndex(Math.max(0, Math.min(next, count - 1))),
    [count],
  )

  /* Reposiciona sem animar quando a largura muda (resize / rotação de tela). */
  useEffect(() => {
    x.set(-index * width)
  }, [width, index, x])

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info
    if (offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD) goTo(index + 1)
    else if (offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD) goTo(index - 1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const keys: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: count - 1,
    }
    if (e.key in keys) {
      e.preventDefault()
      goTo(keys[e.key])
    }
  }

  return (
    <section
      aria-roledescription="carrossel"
      aria-label={label}
      className="relative"
      onKeyDown={handleKeyDown}
    >
      <div ref={containerRef} className="overflow-hidden">
        <motion.div
          className="flex items-stretch"
          drag="x"
          dragConstraints={{ left: -width * (count - 1), right: 0 }}
          dragElastic={0.06}
          style={{ x }}
          animate={{ x: -index * width }}
          transition={reduceMotion ? { duration: 0 } : SPRING}
          onDragEnd={handleDragEnd}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${count}`}
              aria-hidden={i !== index}
              className="shrink-0 flex cursor-grab active:cursor-grabbing"
              style={{ width: width || '100%' }}
            >
              {slide}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between gap-6 px-6 sm:px-10 pt-2 pb-10">
        <div className="flex gap-2" role="tablist" aria-label="Ir para o capítulo">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Capítulo ${i + 1}`}
              onClick={() => goTo(i)}
              className={`
                h-1.5 rounded-full transition-all duration-200
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                focus-visible:outline-ink
                ${i === index ? 'w-8 bg-ink' : 'w-1.5 bg-muted hover:bg-ink'}
              `}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <ArrowButton
            direction="prev"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
          />
          <ArrowButton
            direction="next"
            onClick={() => goTo(index + 1)}
            disabled={index === count - 1}
          />
        </div>
      </div>
    </section>
  )
}

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  disabled: boolean
}) {
  const isPrev = direction === 'prev'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? 'Capítulo anterior' : 'Próximo capítulo'}
      className="
        w-11 h-11 flex items-center justify-center
        border border-rule text-ink
        hover:bg-surface
        disabled:opacity-30 disabled:pointer-events-none
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-ink
        transition-colors duration-200
      "
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={isPrev ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
