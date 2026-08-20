import { Scissors, Star, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const BOOKSY_URL =
  'https://booksy.com/pt-br/instant-experiences/widget/404263?utm_source=ig&utm_medium=social&utm_content=link_in_bio'

export const INSTAGRAM_URL = 'https://instagram.com/basecut_'
export const INSTAGRAM_HANDLE = '@basecut_'

export const GOOGLE_REVIEW_URL =
  'https://www.google.com/search?kgmid=/g/11n3q826nd&hl=pt-BR&q=BASE+CUT+BARBEARIA&shndl=30&source=sh/x/loc/osrp/m1/3&kgs=c1b96cf83428199a&shem=shrtsdl&utm_source=shrtsdl,sh/x/loc/osrp/m1/3'

/** Página da casa no Google Maps — "Como chegar" e avaliações. */
export const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/BASE+CUT+BARBEARIA/@-26.9124079,-48.6652953,17z/data=!4m8!3m7!1s0x94d8cd8b7215b8eb:0xa98d42400a5e5a0d!8m2!3d-26.9124127!4d-48.6627204!9m1!1b1!16s%2Fg%2F11n3q826nd'

/** Embed sem API key, com o pino na casa. */
export const GOOGLE_MAPS_EMBED_URL =
  'https://www.google.com/maps?q=BASE%20CUT%20BARBEARIA%2C%20R.%20Juvenal%20Garc%C3%ADa%2C%2064%2C%20Itaja%C3%AD&z=17&output=embed'

/**
 * Rotas do site — usadas pela navbar e pelo footer.
 *
 * `hoverLabel` é opcional: quando existe, o link troca de palavra no hover.
 * Em "Início" o trocadilho é com o nome da casa — em jogo, a base é o começo.
 */
export const NAV_LINKS = [
  { href: '/', label: 'Início', hoverLabel: 'Base' },
  { href: '/servicos', label: 'Serviços' },
  { href: '/run-club', label: 'Run Club' },
  { href: '/galeria', label: 'Galeria' },
  { href: '/contato', label: 'Contato' },
] as const

export interface Service {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

export const SERVICES: Service[] = [
  {
    id: 'corte',
    icon: Scissors,
    title: 'Corte',
    description: 'Alinhamento perfeito e finalização de alto padrão.',
  },
  {
    id: 'barba',
    icon: Star,
    title: 'Barba',
    description: 'Toalha quente e precisão no alinhamento.',
  },
  {
    id: 'acabamentos',
    icon: Sparkles,
    title: 'Acabamentos',
    description: 'Depilação de nariz e orelha, sobrancelha.',
  },
]
