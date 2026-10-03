import Link from 'next/link'
import type { ReactNode } from 'react'

/** O único destino de agenda da casa: a marcação do próprio site. */
export function LinkAgendar({
  id,
  className,
  children,
  onClick,
}: {
  id?: string
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <Link id={id} href="/agendar" className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

export function AgendaNoColofao() {
  return (
    <div>
      <dt className="uppercase tracking-[0.2em] text-muted">Agenda</dt>
      <dd className="mt-1 text-ink">
        <Link href="/agendar" className="border-b border-rule hover:border-ink">
          No site
        </Link>
      </dd>
    </div>
  )
}
