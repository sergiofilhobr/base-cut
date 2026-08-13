import { Scissors, Star, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const BOOKSY_URL =
  'https://booksy.com/pt-br/instant-experiences/widget/404263?utm_source=ig&utm_medium=social&utm_content=link_in_bio'

export const GOOGLE_REVIEW_URL =
  'https://www.google.com/search?kgmid=/g/11n3q826nd&hl=pt-BR&q=BASE+CUT+BARBEARIA&shndl=30&source=sh/x/loc/osrp/m1/3&kgs=c1b96cf83428199a&shem=shrtsdl&utm_source=shrtsdl,sh/x/loc/osrp/m1/3'

/** Rotas do site — usadas pela navbar e pelo footer. */
export const NAV_LINKS = [
  { href: '/servicos', label: 'Serviços' },
  { href: '/sobre', label: 'A Experiência' },
  { href: '/run-club', label: 'Run Club' },
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
