'use client'

import { SignIn, SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import { BarberPole } from '@/app/components/ui/barber-pole'
import { ThemeToggle } from '@/app/components/ui/theme-toggle'
import { useAparenciaClerk, useSessao } from './sessao'
import { Button } from './ui/button'
import { Campo, Falha, Selecao } from './ui/campo'

type Modo = 'entrar' | 'cadastro'

/**
 * Entrada e cadastro — a mesma moldura para os dois, com chrome próprio
 * (sem nav do site): wordmark, poste e o widget no centro.
 */
export function Entrada({ modo }: { modo: Modo }) {
  const sessao = useSessao()
  const router = useRouter()

  useEffect(() => {
    if (sessao.pronto && sessao.entrou) router.replace('/app')
  }, [router, sessao.entrou, sessao.pronto])

  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <header className="border-b-2 border-ink px-6 sm:px-10 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-black uppercase tracking-[-0.01em] text-xl text-ink hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Base<span className="text-muted">Cut</span>
        </Link>
        <div className="flex items-center gap-5">
          <BarberPole className="hidden sm:flex w-3 h-10" />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 px-6 sm:px-10 py-12 sm:py-16">
        <div className="max-w-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {modo === 'entrar' ? 'Sua agenda' : 'Primeira vez'}
          </p>
          <h1 className="mt-2 font-display font-black uppercase leading-[0.9] tracking-[-0.02em] text-ink text-4xl sm:text-5xl">
            {modo === 'entrar' ? (
              <>
                Entrar
                <br />
                <span className="text-muted">na base.</span>
              </>
            ) : (
              <>
                Criar
                <br />
                <span className="text-muted">sua ficha.</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-sm text-muted">
            {modo === 'entrar'
              ? 'Cliente vê e muda os próprios horários. Equipe abre a agenda da casa.'
              : 'Com a ficha você marca sem digitar os dados de novo, e vê o histórico.'}
          </p>
        </div>

        <div className="mt-10 max-w-md">
          {sessao.modo === 'clerk' && <WidgetClerk modo={modo} />}
          {sessao.modo === 'local' && <EntradaLocal modo={modo} />}
          {sessao.modo === 'ausente' && <SemProvedor />}
        </div>

        <p className="mt-10 text-sm text-muted">
          {modo === 'entrar' ? (
            <>
              Ainda sem ficha?{' '}
              <Link href="/app/cadastro" className="text-ink border-b border-rule hover:border-ink">
                Criar agora
              </Link>
              .
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <Link href="/app/entrar" className="text-ink border-b border-rule hover:border-ink">
                Entrar
              </Link>
              .
            </>
          )}
        </p>
      </main>
    </div>
  )
}

function WidgetClerk({ modo }: { modo: Modo }) {
  const aparencia = useAparenciaClerk()
  if (modo === 'entrar') {
    return (
      <SignIn
        routing="path"
        path="/app/entrar"
        signUpUrl="/app/cadastro"
        fallbackRedirectUrl="/app"
        appearance={aparencia}
      />
    )
  }
  return (
    <SignUp
      routing="path"
      path="/app/cadastro"
      signInUrl="/app/entrar"
      fallbackRedirectUrl="/app"
      appearance={aparencia}
    />
  )
}

/**
 * Entrada local de desenvolvimento. O token é o papel — a API, com
 * AUTH_LOCAL=1, confia nele. Nunca aparece com a chave do Clerk presente.
 */
function EntradaLocal({ modo }: { modo: Modo }) {
  const { entrarLocal } = useSessao()
  const router = useRouter()
  const [quem, setQuem] = useState<'cliente' | 'admin' | 'barbeiro' | 'recepcao'>(
    modo === 'cadastro' ? 'cliente' : 'admin',
  )
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (quem === 'cliente') {
      const limpo = email.trim().toLowerCase()
      if (!limpo.includes('@')) {
        setErro('Digite um e-mail para a ficha.')
        return
      }
      entrarLocal(`local:cliente:${limpo}`)
    } else {
      entrarLocal(`local:equipe:${quem}`)
    }
    router.replace('/app')
  }

  return (
    <form onSubmit={enviar} className="border-2 border-ink p-6 flex flex-col gap-5" noValidate>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        Modo local · sem Clerk
      </p>
      {modo === 'entrar' && (
        <Selecao label="Entrar como" value={quem} onChange={(e) => setQuem(e.target.value as typeof quem)}>
          <option value="admin">Equipe · admin</option>
          <option value="barbeiro">Equipe · barbeiro</option>
          <option value="recepcao">Equipe · recepção</option>
          <option value="cliente">Cliente</option>
        </Selecao>
      )}
      {quem === 'cliente' && (
        <Campo
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          erro={erro}
          ajuda="O e-mail identifica a ficha, como no Clerk."
          placeholder="voce@exemplo.com"
        />
      )}
      <Button type="submit" className="self-start">
        {modo === 'entrar' ? 'Entrar' : 'Continuar'}
      </Button>
    </form>
  )
}

function SemProvedor() {
  return (
    <div className="border-2 border-ink p-6 flex flex-col gap-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Falta configurar</p>
      <p className="text-sm text-ink">
        A entrada precisa da chave pública do Clerk em{' '}
        <code className="font-mono text-xs">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>, ou de{' '}
        <code className="font-mono text-xs">NEXT_PUBLIC_AUTH_LOCAL=1</code> para desenvolver sem ele.
      </p>
      <Falha>Sem um dos dois, ninguém entra.</Falha>
    </div>
  )
}
