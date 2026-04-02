'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { staggerVariants, delayedFade } from '@/app/lib/motion'
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
        bg-neutral-50 dark:bg-[#0a0a0a]
        overflow-hidden
      "
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[700px] h-[700px] rounded-full
          bg-[#c9a96e]/5 dark:bg-[#c9a96e]/[0.04]
          blur-3xl pointer-events-none
        "
      />

      {/* Right-side decorative rule */}
      <div
        aria-hidden="true"
        className="
          absolute top-0 right-0
          w-px h-full
          bg-gradient-to-b from-transparent via-neutral-200/60 dark:via-neutral-800/60 to-transparent
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
          className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#c9a96e]"
        >
          Barbearia de Alto Padrão — Itajaí
        </motion.p>

        {/* H1 */}
        <motion.h1
          variants={delayedFade(0.1)}
          className="
            text-5xl sm:text-7xl md:text-8xl
            font-black leading-[0.95] tracking-tight
            text-neutral-900 dark:text-neutral-50
            mb-8
          "
        >
          PRECISÃO{' '}
          <span className="font-extralight text-neutral-400 dark:text-neutral-600">
            É A BASE.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={delayedFade(0.2)}
          className="
            text-base sm:text-lg leading-relaxed max-w-xl
            text-neutral-600 dark:text-neutral-400
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
              bg-neutral-900 text-neutral-50
              dark:bg-neutral-50 dark:text-neutral-900
              shadow-lg shadow-neutral-900/10 dark:shadow-neutral-50/5
              hover:scale-105 hover:shadow-xl hover:shadow-neutral-900/20
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

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-600">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-neutral-300 dark:from-neutral-700 to-transparent"
        />
      </motion.div>
    </section>
  )
}
