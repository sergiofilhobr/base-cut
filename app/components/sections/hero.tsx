'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { staggerVariants, delayedFade } from '@/app/lib/motion'
import { BarberPole } from '@/app/components/ui/barber-pole'
import { BOOKSY_URL } from '@/app/lib/constants'

/**
 * Hero Section — seção inicial em tela cheia com slogan, subtítulo e CTA principal.
 * Client Component por usar motion do Framer Motion.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="
        relative min-h-screen flex flex-col items-center justify-center
        px-6 pt-24 pb-24
        bg-paper
        overflow-hidden
      "
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[700px] h-[700px] rounded-full
          bg-surface dark:bg-surface
          blur-3xl pointer-events-none
        "
      />

      {/* Barber pole — poste giratório nas laterais (apenas telas largas) */}
      <BarberPole className="hidden lg:flex absolute left-10 xl:left-16 top-1/2 -translate-y-1/2 w-11 h-72" />
      <BarberPole
        className="hidden lg:flex absolute right-10 xl:right-16 top-1/2 -translate-y-1/2 w-11 h-72"
        speed={1}
      />

      {/* Right-side decorative rule */}
      <div
        aria-hidden="true"
        className="
          absolute top-0 right-0
          w-px h-full
          bg-gradient-to-b from-transparent via-rule to-transparent
        "
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-3xl"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.p
          variants={delayedFade(0)}
          className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-muted"
        >
          Barbearia de Alto Padrão — Itajaí
        </motion.p>

        {/* H1 */}
        <motion.h1
          variants={delayedFade(0.1)}
          className="
            text-5xl sm:text-7xl md:text-8xl
            font-black leading-[0.95] tracking-tight
            text-ink
            mb-8
          "
        >
          PRECISÃO{' '}
          <span className="font-extralight text-muted">
            É A BASE.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={delayedFade(0.2)}
          className="
            text-base sm:text-lg leading-relaxed max-w-xl
            text-muted
            mb-12
          "
        >
          Um ambiente pensado nos detalhes. Da recepção ao corte,
          entregamos uma experiência de alto nível.
        </motion.p>

        {/* CTA */}
        <motion.div variants={delayedFade(0.3)}>
          <Link
            id="hero-cta"
            href={BOOKSY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group inline-flex items-center gap-2
              px-8 py-4 rounded-full
              text-sm sm:text-base font-bold tracking-wide uppercase
              bg-ink text-paper
              hover:scale-105
              active:scale-100
              transition-all duration-300 ease-out
            "
          >
            Garantir Meu Horário
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="group-hover:translate-x-0.5 transition-transform duration-300"
            >
              <path
                d="M1 7h12M8 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>
      </motion.div>

    </section>
  )
}
