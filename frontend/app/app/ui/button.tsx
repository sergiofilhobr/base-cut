import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ButtonHTMLAttributes } from 'react'

export function cn(...entradas: ClassValue[]) {
  return twMerge(clsx(entradas))
}

/* Hallmark · component: button · genre: editorial · theme: design.md (daisyUI)
 * states: default · hover · focus · active · disabled · loading · error · success
 * O `btn` do daisyUI na voz de CTA do site: raio zero vem do tema, a
 * tipografia mono caixa alta tracked vem daqui.
 */
export type VarianteBotao = 'default' | 'outline' | 'ghost' | 'quiet'
export type TamanhoBotao = 'default' | 'sm'

const VARIANTE: Record<VarianteBotao, string> = {
  default: 'btn-primary',
  outline: 'btn-outline btn-primary',
  ghost: 'btn-ghost underline-offset-4 hover:underline hover:bg-transparent',
  quiet: 'btn-ghost text-muted hover:text-ink hover:bg-transparent',
}

const TAMANHO: Record<TamanhoBotao, string> = {
  default: '',
  sm: 'btn-sm text-[10px]',
}

/** Classes do botão, para quando o elemento é um <Link>. */
export function classesDoBotao({
  variant = 'default',
  size = 'default',
  className,
}: { variant?: VarianteBotao; size?: TamanhoBotao; className?: string } = {}) {
  return cn(
    'btn font-mono text-[11px] font-normal uppercase tracking-[0.18em] shadow-none',
    VARIANTE[variant],
    TAMANHO[size],
    className,
  )
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  ocupado = false,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: VarianteBotao
  size?: TamanhoBotao
  ocupado?: boolean
}) {
  return (
    <button
      type={type}
      className={classesDoBotao({ variant, size, className })}
      aria-busy={ocupado || undefined}
      disabled={disabled || ocupado}
      {...props}
    >
      {children}
      {ocupado && <span aria-hidden="true" className="loading loading-spinner loading-xs" />}
    </button>
  )
}
