'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { BOOKSY_URL } from '@/app/lib/constants'

/**
 * Um destino só. Enquanto a casa não responde, o rótulo aparece sem link,
 * para o Booksy e o site não ficarem abertos juntos.
 */
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
  const destino = useDestino()
  if (!destino) {
    return (
      <span id={id} className={className}>
        {children}
      </span>
    )
  }
  if (destino === 'site') {
    return (
      <Link id={id} href="/agendar" className={className} onClick={onClick}>
        {children}
      </Link>
    )
  }
  return (
    <a id={id} href={BOOKSY_URL} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
      {children}
    </a>
  )
}

export function AgendaNoColofao() {
  const destino = useDestino()
  return (
    <div>
      <dt className="uppercase tracking-[0.2em] text-muted">Agenda</dt>
      <dd className="mt-1 text-ink">
        {destino === 'site' ? (
          <Link href="/agendar" className="border-b border-rule hover:border-ink">
            No site
          </Link>
        ) : destino === 'booksy' ? (
          <a href={BOOKSY_URL} target="_blank" rel="noopener noreferrer" className="border-b border-rule hover:border-ink">
            Booksy
          </a>
        ) : (
          '—'
        )}
      </dd>
    </div>
  )
}

function useDestino() {
  const [destino, setDestino] = useState<'booksy' | 'site' | null>(null)
  useEffect(() => {
    let ativo = true
    fetch('/api/casa')
      .then(async (resposta) => {
        if (!resposta.ok) throw new Error('casa')
        return (await resposta.json()) as { agendamento?: string }
      })
      .then((dados) => {
        if (ativo) setDestino(dados.agendamento === 'site' ? 'site' : 'booksy')
      })
      .catch(() => {
        if (ativo) setDestino('booksy')
      })
    return () => {
      ativo = false
    }
  }, [])
  return destino
}
