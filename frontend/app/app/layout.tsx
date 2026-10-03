import type { Metadata } from 'next'
import { SessaoProvider } from './sessao'

export const metadata: Metadata = {
  title: 'Base Cut — Agenda',
  robots: { index: false, follow: false },
}

/**
 * /app — o painel da casa e a conta do cliente, debaixo do mesmo teto.
 * O chrome do site (nav N7, footer Ft4) é desligado aqui pelo SiteChrome;
 * quem veste a página é o Shell, com as seções do app no header.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SessaoProvider>{children}</SessaoProvider>
}
