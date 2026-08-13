import type { Metadata } from 'next'
import Link from 'next/link'
import { Services } from '@/app/components/sections/services'
import { BOOKSY_URL } from '@/app/lib/constants'
import servicesData from '@/app/lib/services.json'

export const metadata: Metadata = {
  title: 'Serviços e Preços — Base Cut Barbearia',
  description:
    'Corte, barba, sobrancelha, hidratação e acabamentos. Confira a tabela de preços e agende pelo Booksy.',
}

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function ServicosPage() {
  return (
    <div className="pt-20">
      <Services />

      {/* Tabela de preços */}
      <section className="px-6 pb-28 bg-paper">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-ink mb-10">
            Tabela de preços
          </h2>

          <ul className="divide-y divide-rule">
            {servicesData.services.map((service) => (
              <li
                key={service.name}
                className="flex items-baseline justify-between gap-6 py-5"
              >
                <div>
                  <p className="text-base text-ink">
                    {service.name}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {service.duration}
                  </p>
                </div>
                <p
                  className="text-base font-semibold text-ink shrink-0"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {priceFormatter.format(service.price)}
                </p>
              </li>
            ))}
          </ul>

          <Link
            href={BOOKSY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              mt-12 inline-flex items-center gap-2
              px-7 py-3.5 rounded-full
              text-sm font-bold tracking-wide uppercase whitespace-nowrap
              bg-ink text-paper
              hover:opacity-90 transition-opacity duration-300
            "
          >
            Agendar
          </Link>
        </div>
      </section>
    </div>
  )
}
