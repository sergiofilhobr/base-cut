import { Hero } from '@/app/components/sections/hero'

/**
 * Home — Server Component.
 * Navbar e Footer vivem no layout raiz; cada rota entrega só a sua seção.
 */
export default function Home() {
  return <Hero />
}
