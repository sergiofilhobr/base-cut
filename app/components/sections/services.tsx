import { SERVICES } from '@/app/lib/constants'

/* Hallmark · genre: editorial · macrostructure: Catalogue
 * design-system: design.md · designed-as-app
 */

/**
 * Services — índice tipográfico do que a casa faz.
 *
 * Vive na coluna esquerda de /servicos, ao lado da tabela de preços. Sem
 * cards, sem ícone em quadradinho arredondado: cada serviço é uma linha
 * numerada, separada por régua, com a descrição recuada. Server Component —
 * nenhuma entrada animada (design.md § Motion).
 */
export function Services() {
  return (
    <div>
      <h2
        className="
          font-display font-black uppercase text-ink
          text-2xl sm:text-3xl
          tracking-tight
        "
      >
        O <span className="text-muted">catálogo.</span>
      </h2>

      <ol className="mt-6 border-t-2 border-ink">
        {SERVICES.map(({ id, title, description }, i) => (
          <li
            key={id}
            id={`service-${id}`}
            className="
              border-b border-rule
              py-6
              grid grid-cols-[auto_1fr] sm:grid-cols-[auto_minmax(0,10rem)_minmax(0,1fr)]
              gap-x-6 gap-y-2 items-baseline
            "
          >
            <span
              className="font-mono text-[11px] tracking-[0.2em] text-muted"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display font-black uppercase text-lg sm:text-xl tracking-tight text-ink">
              {title}
            </h3>
            <p className="col-start-2 sm:col-start-3 text-sm leading-relaxed text-muted max-w-prose">
              {description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
