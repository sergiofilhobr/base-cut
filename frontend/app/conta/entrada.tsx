'use client'

import { ClerkProvider, SignIn, useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export function EntradaCliente() {
  const chave = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!chave) return null

  return (
    <ClerkProvider publishableKey={chave}>
      <Fluxo />
    </ClerkProvider>
  )
}

function Fluxo() {
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const [mensagem, setMensagem] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let ativo = true
    void (async () => {
      const token = await getToken()
      if (!token) return
      const resposta = await fetch('/api/conta/entrar', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      })
      const dados = (await resposta.json()) as { nome?: string; erro?: string }
      if (!ativo) return
      if (!resposta.ok) {
        setMensagem(
          dados.erro === 'ficha_inexistente'
            ? 'Ainda não há ficha com o e-mail desta conta. Ela nasce na primeira marcação.'
            : 'Não foi possível abrir a ficha.',
        )
        return
      }
      setMensagem(dados.nome ? `Olá, ${dados.nome}.` : 'Ficha aberta.')
    })()
    return () => {
      ativo = false
    }
  }, [isLoaded, isSignedIn, getToken])

  if (!isLoaded) {
    return <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-muted">Abrindo.</p>
  }

  if (!isSignedIn) {
    return (
      <div className="mt-10">
        <SignIn routing="hash" />
      </div>
    )
  }

  return <p className="mt-10 text-sm text-ink">{mensagem ?? 'Ligando a ficha ao e-mail.'}</p>
}
