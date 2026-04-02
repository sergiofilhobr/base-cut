'use client'

import { motion } from 'framer-motion'
import { AnimatedSection } from '@/app/components/ui/animated-section'
import { fadeUpVariants } from '@/app/lib/motion'

/**
 * About Section — "A Experiência / Todo corte começa pela base".
 * Client Component por usar motion.
 */
export function About() {
  return (
    <AnimatedSection
      id="sobre"
      className="
        relative py-28 px-6
        bg-white dark:bg-neutral-950
        border-y border-neutral-100 dark:border-neutral-900
      "
    >
      {/* Golden top rule */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-[#c9a96e]"
      />

      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          variants={fadeUpVariants}
          className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a96e]"
        >
          A Experiência
        </motion.p>

        <motion.h2
          variants={fadeUpVariants}
          className="
            text-3xl sm:text-4xl md:text-5xl
            font-black tracking-tight leading-tight
            text-neutral-900 dark:text-neutral-50
            mb-8
          "
        >
          TODO CORTE
          <br />
          <span className="font-light text-neutral-400 dark:text-neutral-600">
            COMEÇA PELA BASE
          </span>
        </motion.h2>

        <motion.p
          variants={fadeUpVariants}
          className="
            text-base sm:text-lg leading-relaxed
            text-neutral-600 dark:text-neutral-400
            max-w-xl mx-auto
          "
        >
          Entregamos mais do que um corte: uma{' '}
          <span className="text-neutral-900 dark:text-neutral-200 font-medium">
            experiência de alto padrão
          </span>
          , do começo ao fim.
        </motion.p>

        {/* Divider dots */}
        <motion.div
          variants={fadeUpVariants}
          className="mt-12 flex items-center justify-center gap-4"
        >
          <div className="h-px w-16 bg-neutral-200 dark:bg-neutral-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
          <div className="h-px w-16 bg-neutral-200 dark:bg-neutral-800" />
        </motion.div>
      </div>
    </AnimatedSection>
  )
}
