'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SessaoProvider, useApi, useSessao } from '../app/sessao'

type Ficha = {
  nome: string
  telefone: string
  email: string | null
  agendamentos: unknown[]
  historico: unknown[]
}

export default function PrivacidadePage() {
  return (
    <SessaoProvider>
      <Conteudo />
    </SessaoProvider>
  )
}

function Conteudo() {
  const sessao = useSessao()
  const api = useApi()
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  async function exportar() {
    setAviso(null)
    const resposta = await api.chamar<Ficha>('/api/privacidade/exportar', { metodo: 'POST', corpo: {} })
    if (!resposta.ok || !resposta.dados?.nome) {
      setAviso('Não foi possível abrir a ficha desta sessão.')
      return
    }
    setFicha(resposta.dados)
  }

  async function excluir() {
    setAviso(null)
    const resposta = await api.chamar<{ ok: boolean }>('/api/privacidade/excluir', { metodo: 'POST', corpo: {} })
    if (!resposta.ok || !resposta.dados?.ok) {
      setAviso('Não foi possível excluir a ficha.')
      return
    }
    setFicha(null)
    setAviso('Ficha excluída. Nome, telefone e e-mail saíram do cadastro.')
    await sessao.sair()
  }

  async function sairDasCampanhas() {
    setAviso(null)
    const resposta = await api.chamar<{ recebeCampanha: boolean }>('/api/privacidade/marketing', {
      metodo: 'POST',
      corpo: { optIn: false },
    })
    if (!resposta.ok || resposta.dados?.recebeCampanha !== false) {
      setAviso('Não foi possível sair das campanhas.')
      return
    }
    setAviso('Você saiu das campanhas.')
  }

  return (
    <div className="bg-paper px-6 sm:px-10 pt-24 pb-28">
      <h1 className="font-display font-black uppercase text-ink text-[2.5rem] sm:text-6xl leading-[0.88]">
        Sua
        <br />
        <span className="text-muted">ficha.</span>
      </h1>
      {!sessao.pronto ? (
        <p className="mt-10 text-sm text-ink">Abrindo a sessão.</p>
      ) : !sessao.entrou ? (
        <p className="mt-10 max-w-xl text-sm text-ink">
          A ficha abre com a sua entrada.{' '}
          <Link href="/app/entrar" className="underline">
            Entrar
          </Link>
        </p>
      ) : (
        <div className="mt-10 flex max-w-xl flex-col gap-4">
          <p className="text-sm text-ink">
            {ficha ? `${ficha.nome}, ${ficha.telefone}` : `Sessão de ${sessao.nome ?? sessao.email ?? 'você'}.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="min-h-12 bg-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper"
              onClick={() => void exportar()}
            >
              Exportar
            </button>
            <button
              type="button"
              className="min-h-12 border border-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink"
              onClick={() => void excluir()}
            >
              Excluir
            </button>
            <button
              type="button"
              className="min-h-12 border border-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink"
              onClick={() => void sairDasCampanhas()}
            >
              Sair das campanhas
            </button>
          </div>
          {aviso && <p className="text-sm text-ink">{aviso}</p>}
          {ficha && <pre className="overflow-x-auto text-xs text-ink">{JSON.stringify(ficha, null, 2)}</pre>}
        </div>
      )}
    </div>
  )
}
