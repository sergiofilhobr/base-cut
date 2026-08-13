'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { animated, useReducedMotion, useSpring } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Photo {
  src: string
  alt: string
  width: number
  height: number
}

interface LightboxProps {
  photos: readonly Photo[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

/**
 * Lightbox — visualizador em tela cheia, com arrasto pro lado.
 *
 * Reaproveita o motion system do projeto: a mola do react-spring faz o
 * fade de entrada e a troca de foto, o `@use-gesture/react` lê o arrasto
 * (mesma dupla do Carousel). Fecha com Esc, clique fora ou o X; navega
 * com setas do teclado, arrasto ou os botões laterais.
 */
export function Lightbox({ photos, index, onClose, onIndexChange }: LightboxProps) {
  const reduce = useReducedMotion()
  const count = photos.length
  const closeRef = useRef<HTMLButtonElement>(null)

  const goTo = useCallback(
    (next: number) => onIndexChange(((next % count) + count) % count),
    [count, onIndexChange],
  )

  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goTo(index + 1)
      else if (e.key === 'ArrowLeft') goTo(index - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [index, goTo, onClose])

  const bind = useDrag(
    ({ last, movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (!last) return
      const flick = vx > 0.4
      if (mx < -60 || (flick && dx < 0)) goTo(index + 1)
      else if (mx > 60 || (flick && dx > 0)) goTo(index - 1)
    },
    { axis: 'x', filterTaps: true },
  )

  const overlayStyle = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: reduce ? { duration: 0 } : { tension: 300, friction: 30 },
  })

  const [photoStyle] = useSpring(
    () => ({
      from: { opacity: 0 },
      to: { opacity: 1 },
      config: reduce ? { duration: 0 } : { tension: 300, friction: 30 },
    }),
    [index],
  )

  const photo = photos[index]

  return (
    <animated.div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de fotos"
      className="fixed inset-0 z-[60] bg-ink/95 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="
          absolute top-4 right-4 sm:top-6 sm:right-6
          w-11 h-11 flex items-center justify-center text-paper
          hover:opacity-70
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-paper
          transition-opacity duration-200
        "
      >
        <X size={22} aria-hidden="true" />
      </button>

      <animated.div
        {...bind()}
        style={photoStyle}
        className="relative max-w-5xl w-full px-16 sm:px-24 touch-pan-y"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          priority
          className="block max-h-[80vh] w-auto mx-auto object-contain select-none"
        />
      </animated.div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Foto anterior"
            className="
              absolute left-2 sm:left-6 top-1/2 -translate-y-1/2
              w-11 h-11 flex items-center justify-center text-paper
              hover:opacity-70
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-paper
              transition-opacity duration-200
            "
          >
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Próxima foto"
            className="
              absolute right-2 sm:right-6 top-1/2 -translate-y-1/2
              w-11 h-11 flex items-center justify-center text-paper
              hover:opacity-70
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-paper
              transition-opacity duration-200
            "
          >
            <ChevronRight size={26} aria-hidden="true" />
          </button>

          <p className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.2em] text-paper/70">
            {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </p>
        </>
      )}
    </animated.div>
  )
}
