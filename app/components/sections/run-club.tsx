'use client'

import { motion } from 'framer-motion'
import { MessageCircle, MapPin, Timer, TrendingDown } from 'lucide-react'
import { AnimatedSection } from '@/app/components/ui/animated-section'
import { fadeUpVariants, delayedFade } from '@/app/lib/motion'

/**
 * Link do grupo de WhatsApp do Base Run Club.
 * Substituir pelo link real antes de publicar.
 */
const WHATSAPP_GROUP_URL = '#'

const STATS = [
  { icon: Timer,       label: 'Distância',      value: '3 – 5 km' },
  { icon: TrendingDown, label: 'Ritmo',          value: 'Leve, sem pressão' },
  { icon: MapPin,      label: 'Ponto de encontro', value: 'Base Cut' },
]

/**
 * RunClub Section — divulga o Base Run Club e capta participantes.
 * Client Component por usar motion + AnimatedSection.
 */
export function RunClub() {
  return (
    <AnimatedSection
      id="run-club"
      className="
        relative py-28 px-6
        bg-neutral-100 dark:bg-neutral-900
        overflow-hidden
      "
    >
      {/* Decorative background glow */}
      <div
        aria-hidden="true"
        className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] rounded-full
          bg-[#c9a96e]/[0.06] dark:bg-[#c9a96e]/[0.04]
          blur-3xl pointer-events-none
        "
      />

      {/* Top golden rule — consistent com About */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-[#c9a96e]"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">

        {/* Badge COMUNIDADE */}
        <motion.div variants={fadeUpVariants} className="mb-6 flex justify-center">
          <span
            className="
              inline-flex items-center gap-1.5
              px-3 py-1 rounded-full
              text-[10px] font-bold uppercase tracking-[0.25em]
              bg-[#c9a96e]/15 text-[#c9a96e]
              border border-[#c9a96e]/30
            "
          >
            Comunidade
          </span>
        </motion.div>

        {/* H2 */}
        <motion.h2
          variants={fadeUpVariants}
          className="
            text-4xl sm:text-5xl md:text-6xl
            font-black tracking-tight leading-[0.95]
            text-neutral-900 dark:text-neutral-50
            mb-8
          "
        >
          BASE{' '}
          <span className="font-extralight text-neutral-400 dark:text-neutral-600">
            RUN CLUB
          </span>
        </motion.h2>

        {/* Copy */}
        <motion.p
          variants={fadeUpVariants}
          className="
            text-base sm:text-lg leading-relaxed max-w-2xl mx-auto
            text-neutral-600 dark:text-neutral-400
            mb-12
          "
        >
          Muito mais que um corte, um estilo de vida. Junte-se ao nosso encontro semanal
          para uma corrida leve de 3km a 5km.{' '}
          <span className="text-neutral-900 dark:text-neutral-200 font-medium">
            Sem pressão, foco na resenha e na constância.
          </span>{' '}
          O ponto de encontro é na nossa base.
        </motion.p>

        {/* Stats row */}
        <motion.div
          variants={delayedFade(0.15)}
          className="
            grid grid-cols-1 sm:grid-cols-3 gap-px
            bg-neutral-200 dark:bg-neutral-800
            rounded-2xl overflow-hidden
            mb-8
          "
        >
          {STATS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="
                flex flex-col items-center gap-3 px-8 py-7
                bg-white dark:bg-neutral-950
              "
            >
              <span
                className="
                  w-9 h-9 rounded-xl flex items-center justify-center
                  bg-[#c9a96e]/10 text-[#c9a96e]
                "
              >
                <Icon size={18} strokeWidth={1.5} />
              </span>
              <span className="text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-semibold">
                {label}
              </span>
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {value}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Benefit card */}
        <motion.div
          variants={delayedFade(0.25)}
          className="
            mx-auto max-w-md mb-12
            rounded-2xl
            border border-[#c9a96e]/25
            bg-[#c9a96e]/[0.06] dark:bg-[#c9a96e]/[0.05]
            px-8 py-6
            flex flex-col sm:flex-row items-center gap-4
          "
        >
          <span className="text-2xl select-none" aria-hidden="true">✂️</span>
          <p className="text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-300 leading-snug">
            Corredores do clube têm{' '}
            <span className="font-black text-[#c9a96e]">10% OFF</span>{' '}
            em todos os cortes.
          </p>
        </motion.div>

        {/* CTA — WhatsApp */}
        <motion.div variants={delayedFade(0.35)}>
          <a
            id="run-club-whatsapp-cta"
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group inline-flex items-center gap-2.5
              px-8 py-4 rounded-full
              text-sm sm:text-base font-bold tracking-wide uppercase
              bg-[#25D366] text-white
              shadow-lg shadow-[#25D366]/25
              hover:bg-[#20bf5b] hover:scale-105 hover:shadow-xl hover:shadow-[#25D366]/30
              active:scale-100
              transition-all duration-300 ease-out
            "
          >
            {/* WhatsApp inline SVG icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Entrar no Grupo (WhatsApp)
            <MessageCircle
              size={16}
              strokeWidth={2}
              className="opacity-70 group-hover:translate-x-0.5 transition-transform duration-300"
            />
          </a>
        </motion.div>

      </div>
    </AnimatedSection>
  )
}
