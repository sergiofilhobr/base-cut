import type { Metadata } from 'next'
import { Services } from '@/app/components/sections/services'
import { PriceTable } from '@/app/components/sections/price-table'

export const metadata: Metadata = {
  title: 'Serviços e Preços — Base Cut Barbearia',
  description:
    'Corte, barba, sobrancelha, hidratação e acabamentos. Confira a tabela de preços e agende pelo Booksy.',
}

export default function ServicosPage() {
  return (
    <div className="bg-paper px-6 sm:px-10 pt-24 pb-28">
      <h1
        className="
          font-display font-black uppercase text-ink
          text-[2.5rem] sm:text-6xl md:text-7xl
          leading-[0.88] tracking-[-0.02em] max-w-4xl
        "
        style={{ overflowWrap: 'anywhere' }}
      >
        O que fazemos,
        <br />
        <span className="text-muted">fazemos bem.</span>
      </h1>

      <hr className="mt-10 mb-10 border-0 h-px bg-rule" />

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Services />
        <PriceTable />
      </div>
    </div>
  )
}
