import type { SpringConfig } from '@react-spring/web'

/** Mola equivalente ao easeOut cúbico do sistema (~0.65s). */
export const SMOOTH_CONFIG: SpringConfig = {
  tension: 170,
  friction: 26,
  clamp: true,
}

/** Entrada padrão: sobe 32px enquanto some o fade. */
export const FADE_UP = {
  from: { opacity: 0, y: 32 },
  to: { opacity: 1, y: 0 },
}

/** Fallback de `prefers-reduced-motion`: só opacidade, sem deslocamento. */
export const FADE_ONLY = {
  from: { opacity: 0 },
  to: { opacity: 1 },
}

export function fadeUp(reduce: boolean | null) {
  return reduce ? FADE_ONLY : FADE_UP
}

/** Atraso em ms entre itens de uma lista em cascata. */
export const STAGGER_MS = 150
