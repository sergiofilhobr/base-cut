import { Navbar } from '@/app/components/layout/navbar'
import { Footer } from '@/app/components/layout/footer'
import { Hero } from '@/app/components/sections/hero'
import { About } from '@/app/components/sections/about'
import { Services } from '@/app/components/sections/services'
import { GoogleReview } from '@/app/components/sections/google-review'
import { RunClub } from '@/app/components/sections/run-club'

/**
 * Home Page — Server Component.
 * Orquestra as seções sem lógica própria.
 * Cada seção Client Component gerencia sua própria interatividade.
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <About />
        <Services />
        <RunClub />
        <GoogleReview />
      </main>
      <Footer />
    </>
  )
}
