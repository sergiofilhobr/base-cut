import { LinkAgendar } from '@/app/components/ui/link-agendar'
import servicesData from '@/app/lib/services.json'
import { formatarDuracao, formatarPreco, servicosDaApi } from '@/app/lib/agenda'

/* Hallmark · genre: editorial · macrostructure: Catalogue
 * design-system: design.md · designed-as-app
 */

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

type Linha = { nome: string; preco: string; duracao: string }

/**
 * PriceTable — a tabela completa de preços.
 *
 * Vive na coluna direita de /servicos, ao lado do índice de serviços.
 * Lê a API. Se ela estiver fora, a tabela estática segura a página.
 * O CTA leva à marcação do site.
 */
export async function PriceTable() {
  const linhas = await linhasDePreco()

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
        {linhas.map((service) => (
          <li
            key={service.nome}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <div>
              <p className="text-sm text-ink">{service.nome}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mt-0.5">
                {service.duracao}
              </p>
            </div>
            <p
              className="text-sm font-semibold text-ink shrink-0"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {service.preco}
            </p>
          </li>
        ))}
      </ul>

      <LinkAgendar
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
      </LinkAgendar>
    </div>
  )
}

async function linhasDePreco(): Promise<Linha[]> {
  const servicos = await servicosDaApi()
  if (servicos) {
    return servicos.map((servico) => ({
      nome: servico.nome,
      duracao: formatarDuracao(servico.duracaoMinutos),
      preco: formatarPreco(servico.precoCentavos),
    }))
  }

  return servicesData.services.map((service) => ({
    nome: service.name,
    duracao: service.duration,
    preco: priceFormatter.format(service.price),
  }))
}
