'use client'

import { motion } from 'framer-motion'
import { AnimatedSection } from '@/app/components/ui/animated-section'
import { fadeUpVariants } from '@/app/lib/motion'
import { GOOGLE_REVIEW_URL } from '@/app/lib/constants'

/**
 * GoogleReview Section — social proof com 5 estrelas e link para avaliação.
 * Client Component por usar motion.
 */
export function GoogleReview() {
  return (
    <AnimatedSection
      id="avaliacao"
      className="py-20 px-6 bg-white dark:bg-neutral-950"
    >
      <div className="max-w-5xl mx-auto">
        <motion.a
          variants={fadeUpVariants}
          id="google-review-card"
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            group block w-full
            border border-neutral-200 dark:border-neutral-800
            hover:border-[#c9a96e]/60 dark:hover:border-[#c9a96e]/40
            rounded-2xl p-8 sm:p-10
            bg-neutral-50 dark:bg-[#0a0a0a]
            hover:bg-white dark:hover:bg-neutral-900
            transition-all duration-300
          "
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Google logo */}
            <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>

            {/* Text content */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a96e] mb-3">
                Avaliação no Google
              </p>

              {/* 5 Stars */}
              <div
                className="flex items-center justify-center sm:justify-start gap-1 mb-4"
                aria-label="5 estrelas"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="text-[#c9a96e]"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  5.0
                </span>
              </div>

              <p className="text-base sm:text-lg font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Sua satisfação é a nossa base.{' '}
                <span className="text-neutral-900 dark:text-neutral-50 font-semibold">
                  Avalie sua experiência.
                </span>
              </p>
            </div>

            {/* Arrow CTA */}
            <div className="hidden sm:flex items-center self-center">
              <div
                className="
                  w-10 h-10 rounded-full flex items-center justify-center
                  border border-neutral-200 dark:border-neutral-800
                  group-hover:border-[#c9a96e]/60 dark:group-hover:border-[#c9a96e]/40
                  group-hover:bg-[#c9a96e]/10
                  text-neutral-400 dark:text-neutral-600
                  group-hover:text-[#c9a96e]
                  transition-all duration-300
                "
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.a>
      </div>
    </AnimatedSection>
  )
}
