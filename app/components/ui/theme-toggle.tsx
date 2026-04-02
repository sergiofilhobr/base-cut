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
        className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-800"
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
        border border-neutral-200 dark:border-neutral-800
        bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800
        text-neutral-700 dark:text-neutral-300
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
