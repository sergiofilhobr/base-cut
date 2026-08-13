/* Hallmark · genre: editorial · macrostructure: Catalogue
 * design-system: design.md · designed-as-app
 */

import { GOOGLE_MAPS_EMBED_URL, GOOGLE_MAPS_URL } from '@/app/lib/constants'
import { AVERAGE_RATING, REVIEWS_COUNT } from '@/app/lib/reviews'
import { RatingBadge } from '@/app/components/ui/rating-badge'

/**
 * Location — endereço, "Como chegar" e o mapa.
 *
 * Vive na coluna esquerda de /contato, lado a lado com as avaliações — as
 * duas metades da mesma pergunta ("onde é" + "vale a pena") cabem numa
 * dobra só. O mapa do Google entra em grayscale — o cromático dele não faz
 * parte da paleta; o que importa é o ponto, o endereço e a régua.
 */
export function Location() {
  return (
    <div>
      <address className="font-mono text-[12px] uppercase tracking-[0.2em] not-italic text-ink">
        R. Juvenal García, 64 — Centro, Itajaí SC
      </address>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-block
            text-sm text-ink
            border-b border-ink pb-0.5
            hover:opacity-70
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
            focus-visible:outline-ink
            transition-opacity duration-200
          "
        >
          Como chegar
        </a>

        <RatingBadge rating={AVERAGE_RATING} count={REVIEWS_COUNT} href="#avaliacao" />
      </div>

      <div className="mt-6 border border-rule">
        <iframe
          title="Mapa — Base Cut Barbearia, R. Juvenal García, 64, Itajaí"
          src={GOOGLE_MAPS_EMBED_URL}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="block w-full h-[220px] sm:h-[320px] lg:h-[380px] grayscale"
        />
      </div>
    </div>
  )
}
