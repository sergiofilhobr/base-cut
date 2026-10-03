'use client'

import { useState } from 'react'
import { GOOGLE_REVIEW_URL } from '@/app/lib/constants'

export default function AvaliarPage() {
  const [atendimentoId, setAtendimentoId] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [nota, setNota] = useState(5)
  const [texto, setTexto] = useState('')
  const [google, setGoogle] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  return (
    <div className="bg-paper px-6 pb-28 pt-24 sm:px-10">
      <h1 className="font-display text-[2.5rem] font-black uppercase leading-[0.88] text-ink sm:text-6xl">
        Como
        <br />
        <span className="text-muted">ficou.</span>
      </h1>
      <form
        className="mt-10 flex max-w-xl flex-col gap-4"
        onSubmit={async (evento) => {
          evento.preventDefault()
          setAviso(null)
          const resposta = await fetch('/api/avaliacoes', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ atendimentoId, clienteId, nota, texto }),
          })
          const dados = (await resposta.json()) as { google?: string }
          if (!resposta.ok) {
            setAviso('A avaliação não entrou. Confira o atendimento e a ficha.')
            return
          }
          setGoogle(dados.google ?? GOOGLE_REVIEW_URL)
          setAviso('Recebemos. A casa publica depois de ler.')
        }}
      >
        <input
          required
          placeholder="Atendimento"
          value={atendimentoId}
          onChange={(evento) => setAtendimentoId(evento.target.value)}
          className="border-b border-ink bg-transparent py-3 text-ink"
        />
        <input
          required
          placeholder="Ficha"
          value={clienteId}
          onChange={(evento) => setClienteId(evento.target.value)}
          className="border-b border-ink bg-transparent py-3 text-ink"
        />
        <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Nota
          <input
            type="number"
            min={1}
            max={5}
            value={nota}
            onChange={(evento) => setNota(Number(evento.target.value))}
            className="mt-2 block w-full border-b border-ink bg-transparent py-3 text-base text-ink"
          />
        </label>
        <textarea
          required
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          className="min-h-24 border-b border-ink bg-transparent py-3 text-ink"
        />
        <button
          type="submit"
          className="min-h-12 bg-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper"
        >
          Enviar
        </button>
        {aviso && <p className="text-sm text-ink">{aviso}</p>}
        {google && (
          <a href={google} className="text-sm text-ink underline">
            Deixar a mesma nota no Google
          </a>
        )}
      </form>
    </div>
  )
}
