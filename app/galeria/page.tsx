import type { Metadata } from 'next'
import { Gallery } from '@/app/components/sections/gallery'

export const metadata: Metadata = {
  title: 'Galeria — Base Cut Barbearia',
  description:
    'O barbeiro, o ambiente e os atendimentos da casa — em fotos. R. Juvenal García, 64 — Centro, Itajaí.',
}

export default function GaleriaPage() {
  return (
    <div>
      <Gallery />
    </div>
  )
}
