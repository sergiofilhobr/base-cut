import type { Metadata } from 'next'
import { Location } from '@/app/components/sections/location'
import { GoogleReview } from '@/app/components/sections/google-review'

export const metadata: Metadata = {
  title: 'Contato e Avaliações — Base Cut Barbearia',
  description:
    'Onde é a base: R. Juvenal García, 64 — Centro, Itajaí. Mapa, avaliações e como falar com a gente.',
}

export default function ContatoPage() {
  return (
    <div className="bg-paper px-6 sm:px-10 pt-24 pb-24">
      <h1
        className="
          font-display font-black uppercase text-ink
          text-[2.5rem] sm:text-6xl md:text-7xl
          leading-[0.88] tracking-[-0.02em] max-w-4xl
        "
        style={{ overflowWrap: 'anywhere' }}
      >
        Onde é
        <br />
        <span className="text-muted">a base.</span>
      </h1>

      <hr className="mt-10 mb-10 border-0 h-px bg-rule" />

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Location />
        <GoogleReview />
      </div>
    </div>
  )
}
