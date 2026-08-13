import type { Metadata } from 'next'
import { RunClub } from '@/app/components/sections/run-club'

export const metadata: Metadata = {
  title: 'Base Run — Base Cut Barbearia',
  description:
    'Não é sobre performance, é sobre a experiência. Corrida leve de domingo, saindo da Base Cut.',
}

export default function RunClubPage() {
  return (
    <div className="bg-[var(--paper)]">
      <RunClub />
    </div>
  )
}
