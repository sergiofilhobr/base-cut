'use client'

import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { animated, useReducedMotion, useSpring } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

/**
 * Índice do slide ativo, exposto pra quem vive dentro de um slide —
 * assim o conteúdo pode reagir (fade, dimming) sem o Carousel precisar
 * saber nada sobre esse conteúdo.
 */
const CarouselActiveContext = createContext(0)

export function useCarouselActive() {
  return useContext(CarouselActiveContext)
}

/**
 * Carousel — adaptado de reactbits.dev/components/carousel.
 *
 * Mudanças em relação ao original:
 * · arrasto via `@use-gesture/react` + posição animada com a mola do
 *   `@react-spring/web` (react-spring é o motion system único do projeto);
 * · largura responsiva medida por ResizeObserver, não `baseWidth` fixo em px;
 * · aceita slides arbitrários como children, em vez do card título/descrição/ícone;
 * · cores vêm dos tokens do sistema;
 * · autoplay com botão de pausa visível, hold em hover/focus e opt-out via
 *   `prefers-reduced-motion` (WCAG 2.2.2);
 * · navegação por teclado (setas, Home/End) e ARIA de carrossel.
 */

const VELOCITY_THRESHOLD = 0.4 // px/ms — equivalente ao "flick" do original
const DRAG_BUFFER = 40
const AUTOPLAY_MS = 6000
const SPRING = { tension: 300, friction: 34 }

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
  const [paused, setPaused] = useState(false)
  const [hold, setHold] = useState(false)
  const reduceMotion = useReducedMotion()

  const [{ x }, api] = useSpring(() => ({ x: 0, config: SPRING }))

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

  /* Anima até o slide ativo. Ao redimensionar (largura muda), pula sem
     animar — só a navegação entre índices ganha mola. */
  const prevWidth = useRef(width)
  useEffect(() => {
    const widthChanged = prevWidth.current !== width
    prevWidth.current = width
    api.start({ x: -index * width, immediate: widthChanged || !!reduceMotion })
  }, [width, index, api, reduceMotion])

  /* Avanço automático, em laço. Desligam o ciclo (WCAG 2.2.2): o botão de
     pausa, hover/focus sobre o carrossel, a aba oculta e
     `prefers-reduced-motion`. `index` nas dependências rearma o timer a cada
     navegação — manual ou automática. */
  useEffect(() => {
    if (paused || hold || reduceMotion || count < 2) return
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, hold, reduceMotion, index, count])

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dx], last }) => {
      if (active) {
        api.start({ x: -index * width + mx, immediate: true })
        return
      }
      if (!last) return

      const flick = vx > VELOCITY_THRESHOLD
      if (mx < -DRAG_BUFFER || (flick && dx < 0)) goTo(index + 1)
      else if (mx > DRAG_BUFFER || (flick && dx > 0)) goTo(index - 1)
      else api.start({ x: -index * width, immediate: !!reduceMotion })
    },
    { axis: 'x', filterTaps: true },
  )

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
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocusCapture={() => setHold(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHold(false)
      }}
    >
      <div ref={containerRef} className="overflow-hidden">
        <animated.div
          {...bind()}
          className="flex items-stretch touch-pan-y cursor-grab active:cursor-grabbing"
          style={{ x, touchAction: 'pan-y' }}
        >
          <CarouselActiveContext.Provider value={index}>
            {slides.map((slide, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${count}`}
                aria-hidden={i !== index}
                className="shrink-0 flex"
                style={{ width: width || '100%' }}
              >
                {slide}
              </div>
            ))}
          </CarouselActiveContext.Provider>
        </animated.div>
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
                h-1.5 rounded-full transition-[width,background-color] duration-200
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                focus-visible:outline-ink
                ${i === index ? 'w-8 bg-ink' : 'w-1.5 bg-muted hover:bg-ink'}
              `}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {/* Pausa/retoma o avanço automático — obrigatório com autoplay (WCAG 2.2.2). */}
          {!reduceMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={
                paused ? 'Retomar avanço automático' : 'Pausar avanço automático'
              }
              title={
                paused ? 'Retomar avanço automático' : 'Pausar avanço automático'
              }
              className="
                w-11 h-11 flex items-center justify-center
                border border-rule text-ink
                hover:bg-surface
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-ink
                transition-colors duration-200
              "
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                {paused ? (
                  <path d="M5.5 3.5v9l7-4.5-7-4.5z" fill="currentColor" />
                ) : (
                  <>
                    <path d="M5.5 3.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M10.5 3.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          )}
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
