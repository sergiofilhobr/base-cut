import type { Variants, Transition } from 'framer-motion'

export const smoothTransition: Transition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
}

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
}

export const staggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

export function delayedFade(delay: number): Variants {
  return {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...smoothTransition, delay } as Transition,
    },
  }
}
