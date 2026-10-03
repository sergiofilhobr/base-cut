'use client'

import { usePathname } from 'next/navigation'

/**
 * Rotas que carregam o **próprio** chrome — nelas a página É a interface
 * inteira, então nav e footer do site sairiam sobrando.
 *
 * `/links`, a árvore de links da bio, e tudo sob `/app`, o painel da casa e
 * a conta do cliente, que têm header próprio com as seções do app.
 */
const ROTAS_SEM_CHROME = ['/links']
const PREFIXOS_SEM_CHROME = ['/app']

/**
 * SiteChrome — porteiro da navbar e do footer.
 *
 * `usePathname` já resolve no render do servidor, então em `/links` nada de
 * chrome chega ao HTML — não é um flash que some depois da hidratação.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (ROTAS_SEM_CHROME.includes(pathname)) return null
  if (PREFIXOS_SEM_CHROME.some((prefixo) => pathname === prefixo || pathname.startsWith(`${prefixo}/`))) return null
  return <>{children}</>
}
