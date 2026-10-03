'use client'

import { animated, useInView, useReducedMotion, useSpring } from '@react-spring/web'
import { SMOOTH_CONFIG } from '@/app/lib/motion'

interface AnimatedSectionProps {
  id?: string
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper genérico que dispara um fade-up quando a seção entra no viewport.
 * Precisa ser Client Component por usar `useInView`.
 */
export function AnimatedSection({ id, children, className = '' }: AnimatedSectionProps) {
  const reduce = useReducedMotion()
  const [ref, inView] = useInView({ once: true, amount: 0.2 })

  const from = reduce ? { opacity: 0 } : { opacity: 0, y: 32 }
  const to = reduce ? { opacity: 1 } : { opacity: 1, y: 0 }

  const style = useSpring({
    from,
    to: inView ? to : from,
    config: reduce ? { duration: 150 } : SMOOTH_CONFIG,
  })

  return (
    <animated.section id={id} ref={ref} style={style} className={className}>
      {children}
    </animated.section>
  )
}
