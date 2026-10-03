'use client'

import { ClerkProvider, useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { useTheme } from 'next-themes'

/**
 * Sessão do app — uma porta só para quem está do outro lado do token.
 *
 * Três modos, decididos pelo ambiente:
 * - `clerk`:   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY presente. A instância de
 *              desenvolvimento do Clerk entrega sessão, e-mail e token.
 * - `local`:   NEXT_PUBLIC_AUTH_LOCAL=1, sem chave. Entrada de desenvolvimento
 *              casada com AUTH_LOCAL=1 na API: o token diz o papel.
 * - `ausente`: nenhum dos dois. O app abre e explica o que falta configurar.
 *
 * As páginas nunca falam com o Clerk direto: usam `useSessao()` e `useApi()`.
 */
export type ModoSessao = 'clerk' | 'local' | 'ausente'

export type Sessao = {
  modo: ModoSessao
  pronto: boolean
  entrou: boolean
  nome: string | null
  email: string | null
  token: () => Promise<string | null>
  sair: () => Promise<void>
  /** Só no modo local: grava o token de desenvolvimento. */
  entrarLocal: (token: string) => void
}

const SessaoContext = createContext<Sessao | null>(null)

const CHAVE_CLERK = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const AUTH_LOCAL = process.env.NEXT_PUBLIC_AUTH_LOCAL === '1'
const CHAVE_LOCAL = 'basecut.sessao'

export function modoDaSessao(): ModoSessao {
  if (CHAVE_CLERK) return 'clerk'
  if (AUTH_LOCAL) return 'local'
  return 'ausente'
}

export function SessaoProvider({ children }: { children: ReactNode }) {
  const modo = modoDaSessao()
  if (modo === 'clerk') {
    return (
      <ClerkProvider
        publishableKey={CHAVE_CLERK}
        signInUrl="/app/entrar"
        signUpUrl="/app/cadastro"
        afterSignOutUrl="/app/entrar"
        appearance={{ variables: { borderRadius: '0px' } }}
      >
        <SessaoClerk>{children}</SessaoClerk>
      </ClerkProvider>
    )
  }
  if (modo === 'local') return <SessaoLocal>{children}</SessaoLocal>
  return <SessaoAusente>{children}</SessaoAusente>
}

function SessaoClerk({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth()
  const { user } = useUser()
  const valor = useMemo<Sessao>(
    () => ({
      modo: 'clerk',
      pronto: isLoaded,
      entrou: Boolean(isSignedIn),
      nome: user?.fullName ?? user?.firstName ?? null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      token: () => getToken(),
      sair: () => signOut({ redirectUrl: '/app/entrar' }),
      entrarLocal: () => {},
    }),
    [getToken, isLoaded, isSignedIn, signOut, user],
  )
  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>
}

/* O token local vive no localStorage e é lido como loja externa, para a
   hidratação não divergir: no servidor não há sessão; no cliente, há. */
const ouvintes = new Set<() => void>()
function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}
function lerTokenLocal() {
  try {
    return window.localStorage.getItem(CHAVE_LOCAL)
  } catch {
    return null
  }
}
function gravarTokenLocal(token: string | null) {
  try {
    if (token) window.localStorage.setItem(CHAVE_LOCAL, token)
    else window.localStorage.removeItem(CHAVE_LOCAL)
  } catch {
    /* sem storage, a sessão não sobrevive ao reload */
  }
  ouvintes.forEach((ouvinte) => ouvinte())
}

function SessaoLocal({ children }: { children: ReactNode }) {
  const router = useRouter()
  const tokenLocal = useSyncExternalStore(assinar, lerTokenLocal, () => null)
  const pronto = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const entrarLocal = useCallback((token: string) => gravarTokenLocal(token), [])

  const sair = useCallback(async () => {
    gravarTokenLocal(null)
    router.replace('/app/entrar')
  }, [router])

  const valor = useMemo<Sessao>(() => {
    const partes = tokenLocal?.split(':') ?? []
    const cliente = partes[1] === 'cliente'
    return {
      modo: 'local',
      pronto,
      entrou: Boolean(tokenLocal),
      nome: cliente ? null : partes[2] ? `Equipe · ${partes[2]}` : null,
      email: cliente ? partes.slice(2).join(':') : null,
      token: async () => tokenLocal,
      sair,
      entrarLocal,
    }
  }, [entrarLocal, pronto, sair, tokenLocal])

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>
}

function SessaoAusente({ children }: { children: ReactNode }) {
  const valor = useMemo<Sessao>(
    () => ({
      modo: 'ausente',
      pronto: true,
      entrou: false,
      nome: null,
      email: null,
      token: async () => null,
      sair: async () => {},
      entrarLocal: () => {},
    }),
    [],
  )
  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>
}

export function useSessao() {
  const sessao = useContext(SessaoContext)
  if (!sessao) throw new Error('useSessao fora de <SessaoProvider>')
  return sessao
}

export type Resposta<T> = { ok: boolean; status: number; dados: T | null }

/** fetch com o token da sessão. Corpo objeto vira JSON. */
export function useApi() {
  const { token } = useSessao()
  return useMemo(
    () => ({
      async chamar<T = unknown>(
        caminho: string,
        init?: { metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE'; corpo?: unknown; texto?: string },
      ): Promise<Resposta<T>> {
        const autorizacao = await token()
        const headers: Record<string, string> = {}
        if (autorizacao) headers.authorization = `Bearer ${autorizacao}`
        let body: string | undefined
        if (init?.texto !== undefined) {
          headers['content-type'] = 'text/plain'
          body = init.texto
        } else if (init?.corpo !== undefined) {
          headers['content-type'] = 'application/json'
          body = JSON.stringify(init.corpo)
        }
        try {
          const resposta = await fetch(caminho, { method: init?.metodo ?? 'GET', headers, body })
          const tipo = resposta.headers.get('content-type') ?? ''
          const dados = tipo.includes('application/json')
            ? ((await resposta.json().catch(() => null)) as T | null)
            : null
          return { ok: resposta.ok, status: resposta.status, dados }
        } catch {
          return { ok: false, status: 0, dados: null }
        }
      },
      async baixar(caminho: string, nome: string) {
        const autorizacao = await token()
        const resposta = await fetch(caminho, {
          headers: autorizacao ? { authorization: `Bearer ${autorizacao}` } : {},
        })
        if (!resposta.ok) return false
        const blob = await resposta.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = nome
        link.click()
        URL.revokeObjectURL(url)
        return true
      },
    }),
    [token],
  )
}

/**
 * Aparência dos widgets do Clerk nos dois temas. Os valores são os da tabela
 * do design.md — o Clerk precisa de cor resolvida, não aceita `var()`.
 */
export function useAparenciaClerk() {
  const { resolvedTheme } = useTheme()
  const escuro = resolvedTheme === 'dark'
  return useMemo(
    () => ({
      variables: {
        borderRadius: '0px',
        fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
        colorBackground: escuro ? '#1a1917' : '#f2efe6',
        colorForeground: escuro ? '#f2efe6' : '#1a1917',
        colorInput: escuro ? '#232220' : '#ece7d9',
        colorInputForeground: escuro ? '#f2efe6' : '#1a1917',
        colorPrimary: escuro ? '#f2efe6' : '#1a1917',
        colorPrimaryForeground: escuro ? '#1a1917' : '#f2efe6',
        colorMutedForeground: escuro ? '#8f8d85' : '#5f5d58',
        colorBorder: escuro ? '#34332f' : '#d8d3c6',
      },
      elements: {
        cardBox: 'shadow-none border-2 border-ink',
        card: 'shadow-none',
        footer: 'bg-transparent',
      },
    }),
    [escuro],
  )
}
