'use client'

import { useState } from 'react'
import { formatarHorario, rotuloEstado } from '@/app/lib/agenda'
import { useApi } from '../../sessao'
import { Button, cn } from '../../ui/button'
import { Caixa, Campo, Falha } from '../../ui/campo'
import { Estado } from '../../ui/secao'

export type LinhaDaAgenda = {
  id: string
  nome: string
  telefone: string
  inicio: string
  fim: string
  estado: string
  criadoEm?: string
  servicos: Array<{ id: string | null; nome: string; duracaoMinutos?: number }>
}

export type ServicoBasico = { id: string; nome: string }

const ERROS: Record<string, string> = {
  horario_indisponivel: 'Esse horário já está tomado.',
  estado_invalido: 'Esse horário não está mais confirmado.',
  pedido_invalido: 'Confira a data e a hora.',
  servico_indisponivel: 'Um dos serviços não está mais no catálogo.',
}

/**
 * Uma linha da agenda da casa, com as ações da equipe inline.
 * Hora em display, nome e serviços no meio, estado e ações à direita.
 * "Mais" abre mover e trocar serviços sem sair da lista.
 */
export function LinhaAgenda({
  linha,
  servicos,
  aoMudar,
  compacta = false,
}: {
  linha: LinhaDaAgenda
  servicos: ServicoBasico[]
  aoMudar: () => Promise<void>
  compacta?: boolean
}) {
  const api = useApi()
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [mais, setMais] = useState(false)
  const [novoInicio, setNovoInicio] = useState(paraInputLocal(linha.inicio))
  const [escolhidos, setEscolhidos] = useState(
    linha.servicos.map((servico) => servico.id).filter((id): id is string => Boolean(id)),
  )

  async function agir(nome: string, caminho: string, corpo: unknown) {
    setErro(null)
    setOcupado(nome)
    const resposta = await api.chamar<{ erro?: string }>(caminho, { metodo: 'POST', corpo })
    setOcupado(null)
    if (!resposta.ok) {
      setErro(ERROS[resposta.dados?.erro ?? ''] ?? 'Não foi possível gravar. Tente de novo.')
      return
    }
    setConfirmandoCancelamento(false)
    setMais(false)
    await aoMudar()
  }

  const vivo = linha.estado === 'confirmado'

  return (
    <li className={cn('border-b border-rule py-4', !vivo && 'opacity-80')}>
      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] gap-x-5 gap-y-3 items-start">
        <p className="font-display font-black text-2xl leading-none tabular-nums text-ink">
          {formatarHorario(linha.inicio)}
          <span className="mt-1 block font-mono text-[10px] font-normal tracking-[0.15em] text-muted">
            até {formatarHorario(linha.fim)}
          </span>
        </p>
        <div className="min-w-0">
          <p className="text-base text-ink truncate">{linha.nome}</p>
          <p className="mt-0.5 text-sm text-muted">
            {linha.servicos.map((servico) => servico.nome).join(' + ') || 'Sem serviço'}
          </p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.08em] text-muted">
            <a href={`tel:${linha.telefone}`} className="hover:text-ink">
              {linha.telefone}
            </a>
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 flex flex-wrap items-center gap-2 sm:justify-end">
          <Estado estado={linha.estado} rotulo={rotuloEstado(linha.estado)} />
          {vivo && !compacta && (
            <Button variant="quiet" size="sm" aria-expanded={mais} onClick={() => setMais((atual) => !atual)}>
              {mais ? 'Menos' : 'Mais'}
            </Button>
          )}
        </div>
      </div>

      {vivo && (
        <div className="mt-3 flex flex-wrap gap-2 sm:pl-[5.75rem]">
          <Button
            size="sm"
            ocupado={ocupado === 'concluido'}
            onClick={() => void agir('concluido', `/api/painel/agendamentos/${linha.id}/estado`, { estado: 'concluido' })}
          >
            Concluído
          </Button>
          <Button
            size="sm"
            variant="outline"
            ocupado={ocupado === 'falta'}
            onClick={() => void agir('falta', `/api/painel/agendamentos/${linha.id}/estado`, { estado: 'falta' })}
          >
            Falta
          </Button>
          {confirmandoCancelamento ? (
            <span className="inline-flex items-center gap-2">
              <span className="text-xs text-ink">Cancelar o horário de {linha.nome}?</span>
              <Button
                size="sm"
                variant="outline"
                ocupado={ocupado === 'cancelar'}
                onClick={() =>
                  void agir('cancelar', `/api/painel/agendamentos/${linha.id}/estado`, { estado: 'cancelado_pela_casa' })
                }
              >
                Sim, cancelar
              </Button>
              <Button size="sm" variant="quiet" onClick={() => setConfirmandoCancelamento(false)}>
                Não
              </Button>
            </span>
          ) : (
            <Button size="sm" variant="quiet" onClick={() => setConfirmandoCancelamento(true)}>
              Cancelar
            </Button>
          )}
        </div>
      )}

      {vivo && mais && (
        <div className="mt-5 sm:pl-[5.75rem] grid gap-8 sm:grid-cols-2">
          <form
            className="flex flex-col gap-3"
            onSubmit={(evento) => {
              evento.preventDefault()
              void agir('mover', `/api/painel/agendamentos/${linha.id}/mover`, {
                inicio: new Date(novoInicio).toISOString(),
              })
            }}
          >
            <Campo
              label="Mover para"
              type="datetime-local"
              value={novoInicio}
              onChange={(e) => setNovoInicio(e.target.value)}
              ajuda="Mesmos serviços, outro começo."
            />
            <Button type="submit" variant="outline" size="sm" className="self-start" ocupado={ocupado === 'mover'}>
              Mover
            </Button>
          </form>
          <form
            className="flex flex-col gap-3"
            onSubmit={(evento) => {
              evento.preventDefault()
              void agir('servicos', `/api/painel/agendamentos/${linha.id}/servicos`, { servicoIds: escolhidos })
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Serviços</p>
            <div className="flex flex-col gap-2">
              {servicos.map((servico) => (
                <Caixa
                  key={servico.id}
                  label={servico.nome}
                  checked={escolhidos.includes(servico.id)}
                  onChange={() =>
                    setEscolhidos((atual) =>
                      atual.includes(servico.id) ? atual.filter((id) => id !== servico.id) : [...atual, servico.id],
                    )
                  }
                />
              ))}
            </div>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="self-start"
              disabled={escolhidos.length === 0}
              ocupado={ocupado === 'servicos'}
            >
              Salvar serviços
            </Button>
          </form>
        </div>
      )}

      {erro && (
        <div className="mt-3 sm:pl-[5.75rem]">
          <Falha>{erro}</Falha>
        </div>
      )}
    </li>
  )
}

/** ISO → valor de `datetime-local` no fuso da casa. */
export function paraInputLocal(iso: string) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const ler = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? '00'
  return `${ler('year')}-${ler('month')}-${ler('day')}T${ler('hour')}:${ler('minute')}`
}
