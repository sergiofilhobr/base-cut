'use client'

import { useReducedMotion } from '@react-spring/web'
import { GALLERY_VIDEOS } from '@/app/lib/gallery-videos'

/* Duas cópias em fileira: a segunda metade continua exatamente onde a
   primeira parou, então o laço de `translateX(-50%)` não tem costura. */
const TRACK = [...GALLERY_VIDEOS, ...GALLERY_VIDEOS]

/**
 * VideoAutoSlider — faixa decorativa de reels verticais em loop contínuo.
 *
 * Puramente visual (`aria-hidden`): o mural clicável logo abaixo é quem carrega
 * a Galeria de verdade. A animação é CSS puro (`@keyframes` em globals.css) —
 * a mesma mola do auto-slider de fotos que ele substitui. Os vídeos tocam
 * mutados e em loop; em `prefers-reduced-motion` a faixa vira capas estáticas
 * (poster), sem autoplay e sem deslocamento (design.md § Motion).
 */
export function VideoAutoSlider() {
  const reduce = useReducedMotion()

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
        {TRACK.map((video, i) => (
          <div
            key={i}
            className="
              shrink-0 w-36 h-48 sm:w-52 sm:h-72 lg:w-64 lg:h-80
              border border-rule overflow-hidden bg-surface
            "
          >
            {reduce ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.poster}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={video.src}
                poster={video.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
