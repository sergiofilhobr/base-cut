'use client'

import { FluxoAgendar } from '@/app/agendar/fluxo'
import { Pagina } from '../../ui/secao'
import { useFicha } from '../eu'

/** Marcar — o mesmo fluxo do site, sem pedir os dados que a ficha já tem. */
export default function MarcarPage() {
  const ficha = useFicha()
  if (!ficha) {
    return (
      <Pagina titulo="Só o cliente.">
        <p className="text-sm text-muted max-w-prose">A equipe marca pelo encaixe, na Agenda.</p>
      </Pagina>
    )
  }
  return (
    <Pagina
      eyebrow={`Para ${ficha.nome.split(' ')[0]}`}
      titulo={
        <>
          Marque
          <br />
          <span className="text-muted">o horário.</span>
        </>
      }
    >
      <FluxoAgendar ficha={ficha} destinoAoConcluir="/app" />
    </Pagina>
  )
}
