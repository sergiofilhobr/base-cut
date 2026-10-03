'use client'

import { useState } from 'react'

export default function PrivacidadePage() {
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [ficha, setFicha] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  async function enviar(caminho: string, extra?: Record<string, unknown>) {
    setAviso(null)
    const resposta = await fetch(caminho, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ telefone, email, ...extra }),
    })
    const dados = await resposta.json()
    if (!resposta.ok) {
      setAviso('Não achamos uma ficha com esse telefone e esse e-mail.')
      return dados
    }
    return dados
  }

  return (
    <div className="bg-paper px-6 sm:px-10 pt-24 pb-28">
      <h1 className="font-display font-black uppercase text-ink text-[2.5rem] sm:text-6xl leading-[0.88]">
        Sua
        <br />
        <span className="text-muted">ficha.</span>
      </h1>
      <form className="mt-10 flex max-w-xl flex-col gap-4" onSubmit={(evento) => evento.preventDefault()}>
        <input
          required
          placeholder="Telefone"
          value={telefone}
          onChange={(evento) => setTelefone(evento.target.value)}
          className="border-b border-ink bg-transparent py-3 text-ink"
        />
        <input
          required
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          className="border-b border-ink bg-transparent py-3 text-ink"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="min-h-12 bg-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper"
            onClick={async () => {
              const dados = await enviar('/api/privacidade/exportar')
              if (dados?.nome) setFicha(JSON.stringify(dados, null, 2))
            }}
          >
            Exportar
          </button>
          <button
            type="button"
            className="min-h-12 border border-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink"
            onClick={async () => {
              const dados = await enviar('/api/privacidade/excluir')
              if (dados?.ok) {
                setFicha(null)
                setAviso('Ficha excluída. Nome, telefone e e-mail saíram do cadastro.')
              }
            }}
          >
            Excluir
          </button>
          <button
            type="button"
            className="min-h-12 border border-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink"
            onClick={async () => {
              const dados = await enviar('/api/privacidade/marketing', { optIn: false })
              if (dados?.recebeCampanha === false) setAviso('Você saiu das campanhas.')
            }}
          >
            Sair das campanhas
          </button>
        </div>
        {aviso && <p className="text-sm text-ink">{aviso}</p>}
        {ficha && <pre className="overflow-x-auto text-xs text-ink">{ficha}</pre>}
      </form>
    </div>
  )
}
