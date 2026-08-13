'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AnimatedSection } from '@/app/components/ui/animated-section'
import { fadeUpVariants, delayedFade } from '@/app/lib/motion'
import { BOOKSY_URL, SERVICES } from '@/app/lib/constants'

/**
 * Services Section — grid de cards com os serviços da barbearia.
 * Client Component por usar motion.
 */
export function Services() {
  return (
    <AnimatedSection
      id="servicos"
      className="py-28 px-6 bg-paper"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            variants={fadeUpVariants}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted"
          >
            Nossos Serviços
          </motion.p>
          <motion.h2
            variants={fadeUpVariants}
            className="text-3xl sm:text-4xl font-black tracking-tight text-ink"
          >
            O que fazemos,{' '}
            <span className="font-light text-muted">
              fazemos bem.
            </span>
          </motion.h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-rule rounded-2xl overflow-hidden">
          {SERVICES.map(({ id, icon: Icon, title, description }, i) => (
            <motion.div
              key={id}
              id={`service-${id}`}
              variants={delayedFade(i * 0.12)}
              className="
                group flex flex-col gap-5 p-8 sm:p-10
                bg-surface
                hover:bg-paper
                transition-colors duration-300
              "
            >
              <div
                className="
                  w-10 h-10 rounded-xl flex items-center justify-center
                  bg-surface text-muted
                  group-hover:bg-surface
                  transition-colors duration-300
                "
              >
                <Icon size={20} strokeWidth={1.5} />
              </div>

              <div>
                <h3 className="text-base font-bold text-ink mb-2">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {description}
                </p>
              </div>

              <div className="mt-auto h-px w-0 group-hover:w-8 bg-ink transition-all duration-500 ease-out" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div variants={fadeUpVariants} className="text-center mt-12">
          <Link
            id="services-cta"
            href={BOOKSY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              text-sm font-semibold tracking-wide
              text-muted hover:text-ink
              border-b border-rule hover:border-rule
              pb-0.5
              transition-colors duration-300
            "
          >
            Agendar agora pelo Booksy →
          </Link>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}
