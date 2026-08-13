import Image from 'next/image'
import { GALLERY_PHOTOS } from '@/app/lib/gallery-photos'

/* Duas cópias em fileira: a segunda metade continua exatamente onde a
   primeira parou, então o laço de `translateX(-50%)` não tem costura. */
const TRACK = [...GALLERY_PHOTOS, ...GALLERY_PHOTOS]

/**
 * ImageAutoSlider — faixa decorativa de fotos em loop contínuo.
 *
 * Puramente visual (`aria-hidden`): o mural clicável logo abaixo, com alt
 * text e Lightbox, é quem carrega a Galeria de verdade. A animação é CSS
 * puro (`@keyframes` em globals.css) — mais barato que orquestrar dezenas
 * de nós via JS para um loop infinito — e para com
 * `prefers-reduced-motion` (design.md § Motion). Server Component.
 */
export function ImageAutoSlider() {
  return (
    <div
      aria-hidden="true"
      className="
        relative overflow-hidden py-2
        [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]
        [-webkit-mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]
      "
    >
      <div className="marquee-track flex w-max gap-4 sm:gap-6">
        {TRACK.map((photo, i) => (
          <div
            key={i}
            className="
              shrink-0 w-36 h-36 sm:w-52 sm:h-52 lg:w-64 lg:h-64
              border border-rule overflow-hidden
            "
          >
            <Image
              src={photo.src}
              alt=""
              width={400}
              height={400}
              className="w-full h-full object-cover grayscale"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
