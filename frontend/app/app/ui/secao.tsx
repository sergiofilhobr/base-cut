import type { ReactNode } from 'react'
import { cn } from './button'

/**
 * Cabeçalho de página do app: eyebrow mono + título display, pequeno e
 * funcional — páginas de trabalho não gritam. A ação da página fica à
 * direita a partir de `sm`.
 */
export function Pagina({
  eyebrow,
  titulo,
  acao,
  children,
}: {
  eyebrow?: ReactNode
  titulo: ReactNode
  acao?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="px-6 sm:px-10 py-10 sm:py-12 max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          {eyebrow && (
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{eyebrow}</p>
          )}
          <h1 className="mt-2 font-display font-black uppercase leading-[0.9] tracking-[-0.02em] text-ink text-3xl sm:text-5xl">
            {titulo}
          </h1>
        </div>
        {acao && <div className="shrink-0">{acao}</div>}
      </header>
      <div className="mt-10 flex flex-col gap-14">{children}</div>
    </div>
  )
}

/** Uma seção da página: título em display pequeno sobre régua de 2px. */
export function Secao({
  titulo,
  descricao,
  acao,
  children,
  className,
}: {
  titulo: ReactNode
  descricao?: ReactNode
  acao?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b-2 border-ink pb-3">
        <div>
          <h2 className="font-display font-black uppercase tracking-tight text-ink text-xl">{titulo}</h2>
          {descricao && <p className="mt-1 text-sm text-muted max-w-prose">{descricao}</p>}
        </div>
        {acao}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Régua de dados em mono — a mesma do hero da home, em miniatura. */
export function Regua({ itens }: { itens: Array<{ termo: string; valor: ReactNode }> }) {
  return (
    <div className="stats stats-vertical sm:stats-horizontal w-full border-y-2 border-ink bg-transparent shadow-none [&_.stat]:border-rule">
      {itens.map(({ termo, valor }) => (
        <div key={termo} className="stat px-4 sm:px-6 py-4">
          <div className="stat-title font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{termo}</div>
          <div className="stat-value text-sm sm:text-base font-normal text-ink tabular-nums whitespace-normal">
            {valor}
          </div>
        </div>
      ))}
    </div>
  )
}

export function Vazio({ children }: { children: ReactNode }) {
  return <p className="py-6 text-sm text-muted">{children}</p>
}

export function Carregando({ children = 'Abrindo.' }: { children?: ReactNode }) {
  return (
    <p className="py-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
      <span aria-hidden="true" className="loading loading-dots loading-xs" />
      {children}
    </p>
  )
}

/** Lista ainda sem dados — o skeleton ocupa o lugar das linhas. */
export function EsqueletoLista({ linhas = 3 }: { linhas?: number }) {
  return (
    <ul className="list" aria-hidden="true">
      {Array.from({ length: linhas }, (_, indice) => (
        <li key={indice} className="list-row">
          <div className="skeleton h-8 w-16" />
          <div className="list-col-grow flex flex-col gap-2">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-24" />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Rótulo de estado do agendamento: mono, sem cor — peso e caixa carregam. */
export function Estado({ estado, rotulo }: { estado: string; rotulo: string }) {
  const vivo = estado === 'confirmado'
  const cancelado = estado.startsWith('cancelado') || estado === 'falta'
  return (
    <span
      className={cn(
        'badge badge-sm font-mono text-[10px] uppercase tracking-[0.18em]',
        vivo ? 'badge-outline border-ink text-ink' : 'badge-ghost text-muted',
        cancelado && 'line-through decoration-1',
      )}
    >
      {rotulo}
    </span>
  )
}

/** Disclosure nativo com o sumário na voz dos botões. */
export function Dobra({
  titulo,
  children,
  aberto = false,
}: {
  titulo: ReactNode
  children: ReactNode
  aberto?: boolean
}) {
  return (
    <div className="collapse collapse-plus rounded-none border-b border-base-300">
      <input type="checkbox" defaultChecked={aberto} aria-label={typeof titulo === 'string' ? titulo : 'Abrir'} />
      <div className="collapse-title px-0 py-4 min-h-0 font-mono text-[11px] uppercase tracking-[0.18em] text-ink after:text-muted after:top-4">
        {titulo}
      </div>
      <div className="collapse-content px-0">
        <div className="pb-6">{children}</div>
      </div>
    </div>
  )
}
