'use client'

import { useState, type FormEvent } from 'react'
import {
  diaCivil,
  formatarDiaLongo,
  formatarHorario,
  somarDias,
} from '@/app/lib/agenda'

type Detalhe = {
  id: string
  inicio: string
  fim: string
  estado: string
  podeAlterar: boolean
  servicos: Array<{ id: string | null; nome: string; duracaoMinutos: number }>
}

const ERROS: Record<string, string> = {
  nao_encontrado: 'Não achamos um horário com esse telefone.',
  prazo_encerrado: 'Faltam 2 horas ou menos. Só a casa altera daqui pra frente.',
  horario_indisponivel: 'Esse horário foi tomado. O seu continua o mesmo.',
  estado_invalido: 'Esse horário não está mais confirmado.',
  pedido_invalido: 'Confira o telefone.',
}

export function AlterarHorario({ id }: { id: string }) {
  const [telefone, setTelefone] = useState('')
  const [detalhe, setDetalhe] = useState<Detalhe | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [dia, setDia] = useState(diaCivil())
  const [horarios, setHorarios] = useState<string[]>([])
  const [inicio, setInicio] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const hoje = diaCivil()
  const limite = somarDias(hoje, 30)

  async function carregar(event: FormEvent) {
    event.preventDefault()
    setErro(null)
    const resposta = await fetch(
      `/api/agendamentos/${id}?telefone=${encodeURIComponent(telefone)}`,
    )
    const dados = (await resposta.json()) as Detalhe & { erro?: string }
    if (!resposta.ok) {
      setDetalhe(null)
      setErro(ERROS[dados.erro ?? ''] ?? 'Não foi possível abrir o horário.')
      return
    }
    setDetalhe(dados)
  }

  async function cancelar() {
    setOcupado(true)
    setErro(null)
    const resposta = await fetch(`/api/agendamentos/${id}/cancelar`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ telefone }),
    })
    const dados = (await resposta.json()) as { erro?: string }
    setOcupado(false)
    if (!resposta.ok) {
      setErro(ERROS[dados.erro ?? ''] ?? 'Não foi possível cancelar.')
      return
    }
    setDetalhe((atual) =>
      atual ? { ...atual, estado: 'cancelado_pelo_cliente', podeAlterar: false } : atual,
    )
  }

  async function verHorarios() {
    if (!detalhe) return
    const ids = detalhe.servicos.map((servico) => servico.id).filter(Boolean).join(',')
    if (!ids) return
    const params = new URLSearchParams({ dia, servicoIds: ids, exceto: id })
    const resposta = await fetch(`/api/horarios?${params}`)
    if (!resposta.ok) {
      setHorarios([])
      return
    }
    const dados = (await resposta.json()) as { horarios: string[] }
    setHorarios(dados.horarios)
    setInicio(null)
  }

  async function reagendar() {
    if (!inicio) return
    setOcupado(true)
    setErro(null)
    const resposta = await fetch(`/api/agendamentos/${id}/reagendar`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ telefone, inicio }),
    })
    const dados = (await resposta.json()) as { erro?: string; inicio?: string; fim?: string }
    setOcupado(false)
    if (!resposta.ok || !dados.inicio || !dados.fim) {
      setErro(ERROS[dados.erro ?? ''] ?? 'Não foi possível reagendar.')
      return
    }
    setDetalhe((atual) =>
      atual ? { ...atual, inicio: dados.inicio!, fim: dados.fim! } : atual,
    )
    setHorarios([])
    setInicio(null)
  }

  return (
    <div className="mt-10 max-w-xl">
      {!detalhe && (
        <form onSubmit={carregar} className="flex flex-col gap-5">
          <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Telefone da marcação
            <input
              required
              value={telefone}
              onChange={(evento) => setTelefone(evento.target.value)}
              autoComplete="tel"
              className="mt-2 block w-full border-b border-ink bg-transparent py-3 text-base text-ink outline-none"
            />
          </label>
          {erro && <p className="text-sm text-ink">{erro}</p>}
          <button
            type="submit"
            className="inline-flex min-h-12 items-center self-start bg-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-paper"
          >
            Abrir
          </button>
        </form>
      )}

      {detalhe && (
        <div>
          <p className="font-display text-4xl font-black uppercase leading-none text-ink">
            {formatarHorario(detalhe.inicio)}
          </p>
          <p className="mt-3 text-sm capitalize text-muted">{formatarDiaLongo(detalhe.inicio)}</p>
          <ul className="mt-6 border-t-2 border-ink">
            {detalhe.servicos.map((servico) => (
              <li key={servico.nome} className="border-b border-rule py-3 text-sm text-ink">
                {servico.nome}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {rotuloEstado(detalhe.estado)}
          </p>
          {erro && <p className="mt-4 text-sm text-ink">{erro}</p>}

          {detalhe.podeAlterar && (
            <div className="mt-8">
              <button
                type="button"
                disabled={ocupado}
                onClick={() => void cancelar()}
                className="min-h-12 border border-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink"
              >
                Cancelar
              </button>

              <div className="mt-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  Outro dia e hora, os mesmos serviços
                </p>
                <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  Dia
                  <input
                    type="date"
                    value={dia}
                    min={hoje}
                    max={limite}
                    onChange={(evento) => setDia(evento.target.value)}
                    className="mt-2 block w-full border-b border-ink bg-transparent py-3 text-base text-ink"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void verHorarios()}
                  className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-ink underline"
                >
                  Ver horários livres
                </button>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {horarios.map((horario) => (
                    <li key={horario}>
                      <button
                        type="button"
                        aria-pressed={inicio === horario}
                        onClick={() => setInicio(horario)}
                        className={`min-h-11 px-3 py-2 font-mono text-xs ${
                          inicio === horario ? 'bg-ink text-paper' : 'border border-rule text-ink'
                        }`}
                      >
                        {formatarHorario(horario)}
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={!inicio || ocupado}
                  onClick={() => void reagendar()}
                  className="mt-6 inline-flex min-h-12 items-center bg-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-paper disabled:opacity-40"
                >
                  Reagendar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function rotuloEstado(estado: string) {
  if (estado === 'confirmado') return 'Confirmado'
  if (estado === 'cancelado_pelo_cliente') return 'Cancelado'
  if (estado === 'cancelado_pela_casa') return 'Cancelado pela casa'
  if (estado === 'concluido') return 'Concluído'
  if (estado === 'falta') return 'Falta'
  return estado
}
