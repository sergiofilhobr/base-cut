import type { Metadata } from 'next'
import { FluxoAgendar } from './fluxo'

export const metadata: Metadata = {
  title: 'Agendar — Base Cut Barbearia',
  description: 'Escolha o serviço e um horário livre na agenda da Base Cut.',
  robots: { index: false, follow: false },
}

export default function AgendarPage() {
  return (
    <div className="bg-paper px-6 sm:px-10 pt-24 pb-28">
      <h1
        className="
          font-display font-black uppercase text-ink
          text-[2.5rem] sm:text-6xl
          leading-[0.88] tracking-[-0.02em] max-w-4xl
        "
      >
        Marque
        <br />
        <span className="text-muted">o horário.</span>
      </h1>
      <FluxoAgendar />
    </div>
  )
}
