'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

/**
 * ThemeToggle — switch deslizante (base: uiverse.io/Yaya12085).
 *
 * Checkbox real + label: semântica de `switch` de graça, foco visível via
 * `#theme-switch:focus-visible`. As cores vêm dos tokens — a bolinha contrasta
 * com o trilho nos dois temas. Os ícones ficam nas pontas do trilho: a
 * bolinha cobre o do estado ativo, então o visível é o destino do clique.
 * O deslize é por `transform` e o tilt 3D do hover colapsa com
 * `prefers-reduced-motion` (ver o bloco no globals.css).
 * Usa mounted state para evitar hydration mismatch com next-themes.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    /* Mesma caixa do switch — nada de layout shift na hidratação. */
    return (
      <div
        className="h-6 w-11 rounded-full border border-rule"
        aria-hidden="true"
      />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <>
      <input
        id="theme-switch"
        type="checkbox"
        role="switch"
        checked={isDark}
        aria-checked={isDark}
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        onChange={() => setTheme(isDark ? 'light' : 'dark')}
        className="sr-only"
      />
      <label htmlFor="theme-switch" className="theme-switch">
        <Sun
          size={11}
          strokeWidth={1.5}
          aria-hidden="true"
          className="absolute left-[4px] top-1/2 -translate-y-1/2 text-muted"
        />
        <Moon
          size={11}
          strokeWidth={1.5}
          aria-hidden="true"
          className="absolute right-[4px] top-1/2 -translate-y-1/2 text-muted"
        />
      </label>
    </>
  )
}
