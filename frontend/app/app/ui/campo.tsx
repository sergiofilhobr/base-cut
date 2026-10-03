import { cn } from './button'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

/* Hallmark · component: input · genre: editorial · theme: design.md (daisyUI)
 * `fieldset` + `legend` do daisyUI: rótulo acima em mono, campo com borda
 * constante (o tema dá raio zero), ajuda abaixo com altura reservada; o
 * erro ocupa o lugar dela.
 */
const LEGENDA = 'fieldset-legend font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-muted pb-1.5'

type Base = {
  label: string
  ajuda?: string
  erro?: string | null
  className?: string
}

export function Rotulo({ children }: { children: ReactNode }) {
  return <legend className={LEGENDA}>{children}</legend>
}

function Ajuda({ id, ajuda, erro }: { id: string; ajuda?: string; erro?: string | null }) {
  return (
    <p
      id={id}
      role={erro ? 'alert' : undefined}
      className={cn('label mt-1 min-h-[1lh] text-xs whitespace-normal', erro ? 'text-ink' : 'text-muted')}
    >
      {erro ?? ajuda ?? ''}
    </p>
  )
}

function idDe(prefixo: string, label: string, id?: string) {
  return id ?? `${prefixo}-${label.toLowerCase().replace(/\W+/g, '-')}`
}

export function Campo({ label, ajuda, erro, className, id, ...props }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const campoId = idDe('campo', label, id)
  return (
    <fieldset className={cn('fieldset p-0', className)}>
      <Rotulo>{label}</Rotulo>
      <input
        id={campoId}
        aria-label={label}
        aria-invalid={erro ? true : undefined}
        aria-describedby={`${campoId}-ajuda`}
        className={cn('input w-full text-base', erro && 'input-error')}
        {...props}
      />
      <Ajuda id={`${campoId}-ajuda`} ajuda={ajuda} erro={erro} />
    </fieldset>
  )
}

export function Selecao({
  label,
  ajuda,
  erro,
  className,
  id,
  children,
  ...props
}: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const campoId = idDe('selecao', label, id)
  return (
    <fieldset className={cn('fieldset p-0', className)}>
      <Rotulo>{label}</Rotulo>
      <select
        id={campoId}
        aria-label={label}
        aria-invalid={erro ? true : undefined}
        aria-describedby={`${campoId}-ajuda`}
        className={cn('select w-full text-base', erro && 'select-error')}
        {...props}
      >
        {children}
      </select>
      <Ajuda id={`${campoId}-ajuda`} ajuda={ajuda} erro={erro} />
    </fieldset>
  )
}

export function AreaDeTexto({
  label,
  ajuda,
  erro,
  className,
  id,
  ...props
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const campoId = idDe('area', label, id)
  return (
    <fieldset className={cn('fieldset p-0', className)}>
      <Rotulo>{label}</Rotulo>
      <textarea
        id={campoId}
        aria-label={label}
        aria-invalid={erro ? true : undefined}
        aria-describedby={`${campoId}-ajuda`}
        className={cn('textarea w-full min-h-24 text-base', erro && 'textarea-error')}
        {...props}
      />
      <Ajuda id={`${campoId}-ajuda`} ajuda={ajuda} erro={erro} />
    </fieldset>
  )
}

/** Checkbox com o texto ao lado — é um checkbox, e se comporta como um. */
export function Caixa({
  label,
  className,
  ...props
}: { label: ReactNode; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('label cursor-pointer items-start gap-3 whitespace-normal text-sm text-ink', className)}>
      <input type="checkbox" className="checkbox checkbox-sm mt-0.5 shrink-0" {...props} />
      <span>{label}</span>
    </label>
  )
}

/** Mensagem de falha fora de campo. Sucesso é silencioso (design.md). */
export function Falha({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <div role="alert" className="alert alert-error alert-soft text-sm py-2 px-3 border-l-2 border-ink">
      <span>{children}</span>
    </div>
  )
}
