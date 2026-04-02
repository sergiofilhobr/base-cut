'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { staggerVariants } from '@/app/lib/motion'

interface AnimatedSectionProps {
  id?: string
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper genérico que dispara animações stagger quando a seção
 * entra no viewport. Precisa ser Client Component por usar useInView.
 */
export function AnimatedSection({ id, children, className = '' }: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      id={id}
      ref={ref}
      variants={staggerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  )
}
