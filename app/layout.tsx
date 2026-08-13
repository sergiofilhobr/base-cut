import type { Metadata } from 'next'
import { Inter, Archivo, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './components/providers'
import { Navbar } from './components/layout/navbar'
import { Footer } from './components/layout/footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

/** Display: grotesk pesado em caixa alta — a voz do deck do Base Run. */
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
})

/** Mono: eyebrows e contadores de capítulo. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Base Cut Barbearia – Itajaí',
  description:
    'Barbearia de alto padrão em Itajaí. Corte, barba e acabamentos com precisão e experiência completa. Agende pelo Booksy.',
  keywords: ['barbearia', 'itajaí', 'corte', 'barba', 'base cut'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Base Cut Barbearia – Itajaí',
    description: 'Um ambiente pensado nos detalhes. Agende seu horário.',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${archivo.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper text-ink antialiased transition-colors duration-300 min-h-dvh flex flex-col">
        <Providers>
          <Navbar />
          {/* min-h-dvh + flex-1: o main sempre preenche o espaço entre navbar e
              footer, então toda página tem a mesma altura mínima. */}
          <main className="relative flex-1 overflow-x-hidden">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
