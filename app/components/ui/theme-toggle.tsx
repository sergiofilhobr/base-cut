'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

/**
 * ThemeToggle — Client Component isolado.
 * Usa mounted state para evitar hydration mismatch com next-themes.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        className="w-9 h-9 rounded-full border border-rule"
        aria-hidden="true"
      />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      id="theme-toggle"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="
        relative w-9 h-9 rounded-full flex items-center justify-center
        border border-rule
        bg-transparent hover:bg-surface
        text-muted
        transition-all duration-300 ease-in-out
        cursor-pointer
      "
    >
      <span className="transition-all duration-300 ease-in-out">
        {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
      </span>
    </button>
  )
}
