import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-50 antialiased transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
