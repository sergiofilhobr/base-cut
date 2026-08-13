import type { Metadata } from 'next'
import { GoogleReview } from '@/app/components/sections/google-review'

export const metadata: Metadata = {
  title: 'Contato e Avaliações — Base Cut Barbearia',
  description:
    'Onde estamos, como falar com a gente e o que os clientes dizem. R. Juvenal García, 64 — Centro, Itajaí.',
}

export default function ContatoPage() {
  return (
    <div className="pt-20">
      <GoogleReview />
    </div>
  )
}
