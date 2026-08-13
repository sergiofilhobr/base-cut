'use client'

/* Hallmark · genre: editorial · macrostructure: Catalogue
 * design-system: design.md · designed-as-app
 */

import { useState } from 'react'
import Image from 'next/image'
import { animated, useInView, useReducedMotion, useTrail } from '@react-spring/web'
import { SMOOTH_CONFIG } from '@/app/lib/motion'
import { GALLERY_PHOTOS as PHOTOS } from '@/app/lib/gallery-photos'
import { ImageAutoSlider } from '@/app/components/ui/image-auto-slider'
import { Lightbox } from '@/app/components/ui/lightbox'

/**
 * Gallery — mural fotográfico.
 *
 * As fotos entram em cascata ao cruzar a dobra — mesma mola do resto do
 * sistema (design.md § Motion, exceção declarada como em /contato). Em
 * grayscale por padrão, coloridas no hover/focus: o convite é olhar de perto.
 */
export function Gallery() {
  const reduce = useReducedMotion()
  const [ref, inView] = useInView({ once: true, amount: 0.05 })
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const from = reduce ? { opacity: 0 } : { opacity: 0, y: 32 }
  const to = reduce ? { opacity: 1 } : { opacity: 1, y: 0 }

  const trail = useTrail(PHOTOS.length, {
    from,
    to: inView ? to : from,
    config: reduce ? { duration: 150 } : SMOOTH_CONFIG,
  })

  return (
    <section id="galeria" className="bg-paper">
      <div className="px-6 sm:px-10 pt-24 pb-16">
        <h1
          className="
            font-display font-black uppercase text-ink
            text-[2.5rem] sm:text-6xl md:text-7xl
            leading-[0.88] tracking-[-0.02em] max-w-4xl
          "
          style={{ overflowWrap: 'anywhere' }}
        >
          Galeria
        </h1>

        <hr className="mt-10 mb-8 border-0 h-px bg-rule" />

        <div className="sm:pl-[12%] max-w-2xl">
          <p className="text-base sm:text-lg leading-relaxed text-muted">
            O barbeiro e o ambiente da casa, em foto real — sem still, sem
            produção.
          </p>
        </div>
      </div>

      <div className="pb-16">
        <ImageAutoSlider />
      </div>

      <div
        ref={ref}
        className="px-6 sm:px-10 pb-28 columns-2 lg:columns-3 gap-4 sm:gap-6"
      >
        {trail.map((style, i) => {
          const { src, alt, width, height } = PHOTOS[i]
          return (
            <animated.figure
              key={src}
              style={style}
              className="mb-4 sm:mb-6 break-inside-avoid border border-rule"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`Ampliar foto: ${alt}`}
                className="
                  block w-full cursor-pointer
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                  focus-visible:outline-ink
                "
              >
                <Image
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  className="
                    block w-full h-auto
                    grayscale hover:grayscale-0
                    transition-[filter] duration-300
                  "
                />
              </button>
            </animated.figure>
          )
        })}
      </div>

      {openIndex !== null && (
        <Lightbox
          photos={PHOTOS}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}
    </section>
  )
}
