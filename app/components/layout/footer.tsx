import Link from 'next/link'
import { BOOKSY_URL } from '@/app/lib/constants'

/* Hallmark · footer archetype: Ft4 Dense colophon · design-system: design.md */

/**
 * Footer — Ft4 Dense colophon.
 *
 * Um bloco denso em mono: endereço, contato e créditos, no ritmo de um colofão
 * editorial. Sem colunas de links de sitemap, sem fileira de ícones sociais e
 * sem a linha de copyright isolada no rodapé do rodapé.
 */
const COLOPHON = [
  { termo: 'Endereço', valor: 'R. Juvenal García, 64 — Centro, Itajaí SC' },
  { termo: 'Agenda', valor: 'Booksy', href: BOOKSY_URL },
  { termo: 'Instagram', valor: '@basecut_', href: 'https://instagram.com/basecut_' },
  {
    termo: 'Barbeiro',
    valor: '@brunobasecut',
    href: 'https://instagram.com/brunobasecut',
  },
  { termo: 'Base Run', valor: 'Domingos, saindo da base' },
]

export function Footer() {
  return (
    <footer id="contato" className="bg-paper border-t-2 border-ink">
      <div className="px-6 sm:px-10 py-16">
        <p className="font-display font-black uppercase text-2xl tracking-[-0.01em] text-ink">
          Base<span className="text-muted">Cut</span>
        </p>

        <dl className="mt-10 font-mono text-[12px] flex flex-wrap gap-x-10 gap-y-6">
          {COLOPHON.map(({ termo, valor, href }) => (
            <div key={termo}>
              <dt className="uppercase tracking-[0.2em] text-muted">
                {termo}
              </dt>
              <dd className="mt-1 text-ink">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      border-b border-rule hover:border-ink
                      focus-visible:outline focus-visible:outline-2
                      focus-visible:outline-offset-4 focus-visible:outline-ink
                      transition-colors duration-200
                    "
                  >
                    {valor}
                  </a>
                ) : (
                  valor
                )}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 font-mono text-[11px] leading-loose text-muted max-w-2xl">
          Base Cut Barbearia, Itajaí — Santa Catarina. Feito por{' '}
          <a
            id="dev-signature"
            href="https://instagram.com/sergiofilhobr"
            target="_blank"
            rel="noopener noreferrer"
            className="
              text-ink border-b border-rule hover:border-ink
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-4 focus-visible:outline-ink
              transition-colors duration-200
            "
          >
            @sergiofilhobr
          </a>
          . © {new Date().getFullYear()}.
        </p>

        <Link
          id="footer-cta"
          href={BOOKSY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-10 inline-flex items-center px-8 py-4
            font-mono text-xs uppercase tracking-[0.2em] whitespace-nowrap
            bg-ink text-paper
            hover:opacity-90
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
            focus-visible:outline-ink
            transition-opacity duration-200
          "
        >
          Agendar horário
        </Link>
      </div>
    </footer>
  )
}
