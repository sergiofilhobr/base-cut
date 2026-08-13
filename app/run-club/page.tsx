import type { Metadata } from 'next'
import { RunClub } from '@/app/components/sections/run-club'

export const metadata: Metadata = {
  title: 'Base Run — Base Cut Barbearia',
  description:
    'Não é sobre performance, é sobre a experiência. Corrida leve de domingo, saindo da Base Cut.',
}

export default function RunClubPage() {
  /* pt-20 abre espaço para a navbar fixa, mantendo o papel escuro sangrando até o topo. */
  return (
    <div className="pt-20 bg-[var(--paper)]">
      <RunClub />
    </div>
  )
}
