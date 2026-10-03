import Link from 'next/link'
import { BOOKSY_URL } from '@/app/lib/constants'
import servicesData from '@/app/lib/services.json'

/* Hallmark · genre: editorial · macrostructure: Catalogue
 * design-system: design.md · designed-as-app
 */

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/**
 * PriceTable — a tabela completa de preços.
 *
 * Vive na coluna direita de /servicos, ao lado do índice de serviços.
 * Tipografia e régua: nome e duração à esquerda, preço à direita, CTA
 * primário ao final.
 */
export function PriceTable() {
  return (
    <div>
      <h2
        className="
          font-display font-black uppercase text-ink
          text-2xl sm:text-3xl
          tracking-tight
        "
      >
        Tabela de <span className="text-muted">preços.</span>
      </h2>

      <ul className="mt-6 divide-y divide-rule border-t-2 border-ink">
        {servicesData.services.map((service) => (
          <li
            key={service.name}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <div>
              <p className="text-sm text-ink">{service.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mt-0.5">
                {service.duration}
              </p>
            </div>
            <p
              className="text-sm font-semibold text-ink shrink-0"
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
          mt-8 inline-flex items-center px-8 py-4
          font-mono text-xs uppercase tracking-[0.2em] whitespace-nowrap
          bg-ink text-paper
          hover:opacity-90
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
          focus-visible:outline-ink
          transition-opacity duration-200
        "
      >
        Agendar
      </Link>
    </div>
  )
}
