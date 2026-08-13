import type { Metadata } from 'next'
import { About } from '@/app/components/sections/about'

export const metadata: Metadata = {
  title: 'A Experiência — Base Cut Barbearia',
  description:
    'Todo corte começa pela base. Um ambiente pensado nos detalhes, da recepção ao acabamento.',
}

export default function SobrePage() {
  return (
    <div className="pt-20">
      <About />
    </div>
  )
}
