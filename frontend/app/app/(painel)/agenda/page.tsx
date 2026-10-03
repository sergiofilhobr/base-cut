'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  diaCivil,
  diaCivilDe,
  formatarDiaLongo,
  formatarHorario,
  intervaloDaSemana,
  intervaloDoDia,
  somarDias,
} from '@/app/lib/agenda'
import { useApi } from '../../sessao'
import { Button, cn } from '../../ui/button'
import { Campo, Falha, Selecao } from '../../ui/campo'
import { Carregando, Dobra, Pagina, Secao, Vazio } from '../../ui/secao'
import { useEquipe } from '../eu'
import { rotuloMotivo } from '../hoje'
import { LinhaAgenda, type LinhaDaAgenda, type ServicoBasico } from './linha-agenda'

type Bloqueio = { id: string; inicio: string; fim: string; motivo: string }
type Barbeiro = { id: string; nome: string }
type Modo = 'dia' | 'semana'

/** Agenda — dia ou semana, por barbeiro, com encaixe e indisponibilidade. */
export default function AgendaPage() {
  const equipe = useEquipe()
  const api = useApi()
  const [modo, setModo] = useState<Modo>('dia')
  const [dia, setDia] = useState(diaCivil())
  const [barbeiroId, setBarbeiroId] = useState('')
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([])
  const [servicos, setServicos] = useState<ServicoBasico[]>([])
  const [linhas, setLinhas] = useState<LinhaDaAgenda[] | null>(null)
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([])
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    const { de, ate } = modo === 'dia' ? intervaloDoDia(dia) : intervaloDaSemana(dia)
    const filtro = barbeiroId ? `&barbeiroId=${encodeURIComponent(barbeiroId)}` : ''
    return api
      .chamar<{ agendamentos: LinhaDaAgenda[]; bloqueios: Bloqueio[] }>(
        `/api/painel/agenda?de=${encodeURIComponent(de)}&ate=${encodeURIComponent(ate)}${filtro}`,
      )
      .then((resposta) => {
        if (!resposta.ok || !resposta.dados) {
          setErro(resposta.status === 401 ? 'A conta precisa ser da equipe.' : 'A agenda não respondeu.')
          setLinhas([])
          return
        }
        setErro(null)
        setLinhas(resposta.dados.agendamentos)
        setBloqueios(resposta.dados.bloqueios)
      })
  }, [api, barbeiroId, dia, modo])

  useEffect(() => {
    void carregar()
  }, [carregar])

  useEffect(() => {
    void api.chamar<{ servicos: ServicoBasico[] }>('/api/servicos').then((r) => setServicos(r.dados?.servicos ?? []))
    void api.chamar<{ barbeiros: Barbeiro[] }>('/api/barbeiros').then((r) => setBarbeiros(r.dados?.barbeiros ?? []))
  }, [api])

  /* Aviso do navegador quando entra horário novo — só com permissão dada. */
  useEffect(() => {
    if (typeof Notification === 'undefined') return
    const desde = new Date().toISOString()
    const vistos = new Set<string>()
    const timer = window.setInterval(async () => {
      if (Notification.permission !== 'granted') return
      const resposta = await api.chamar<{ agendamentos: LinhaDaAgenda[] }>(
        `/api/painel/novos?desde=${encodeURIComponent(desde)}`,
      )
      let chegou = false
      for (const linha of resposta.dados?.agendamentos ?? []) {
        if (vistos.has(linha.id)) continue
        vistos.add(linha.id)
        chegou = true
        new Notification('Horário novo', { body: `${linha.nome} · ${formatarHorario(linha.inicio)}` })
      }
      if (chegou) void carregar()
    }, 20000)
    return () => window.clearInterval(timer)
  }, [api, carregar])

  const porDia = useMemo(() => {
    const grupos = new Map<string, LinhaDaAgenda[]>()
    for (const linha of linhas ?? []) {
      const chave = diaCivilDe(linha.inicio)
      grupos.set(chave, [...(grupos.get(chave) ?? []), linha])
    }
    return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [linhas])

  if (!equipe) return <SoEquipe />

  const passo = modo === 'dia' ? 1 : 7

  return (
    <Pagina
      eyebrow={modo === 'dia' ? formatarDiaLongo(`${dia}T12:00:00-03:00`) : 'Semana'}
      titulo={
        <>
          Agenda
          <br />
          <span className="text-muted">da casa.</span>
        </>
      }
      acao={
        typeof Notification !== 'undefined' && Notification.permission === 'default' ? (
          <Button variant="outline" onClick={() => void Notification.requestPermission()}>
            Avisar horário novo
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div role="group" aria-label="Período" className="join">
          {(['dia', 'semana'] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              aria-pressed={modo === opcao}
              onClick={() => setModo(opcao)}
              className={cn(
                'btn join-item font-mono text-[11px] font-normal uppercase tracking-[0.18em] shadow-none',
                modo === opcao ? 'btn-primary' : 'btn-outline',
              )}
            >
              {opcao === 'dia' ? 'Dia' : 'Semana'}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <Button variant="outline" aria-label="Anterior" onClick={() => setDia(somarDias(dia, -passo))}>
            ←
          </Button>
          <Campo label="Dia" type="date" value={dia} onChange={(e) => setDia(e.target.value)} className="w-44 [&_p]:hidden" />
          <Button variant="outline" aria-label="Seguinte" onClick={() => setDia(somarDias(dia, passo))}>
            →
          </Button>
          <Button variant="ghost" onClick={() => setDia(diaCivil())}>
            Hoje
          </Button>
        </div>
        {barbeiros.length > 1 && (
          <Selecao label="Profissional" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)} className="w-56 [&_p]:hidden">
            <option value="">Primeiro da casa</option>
            {barbeiros.map((barbeiro) => (
              <option key={barbeiro.id} value={barbeiro.id}>
                {barbeiro.nome}
              </option>
            ))}
          </Selecao>
        )}
      </div>

      <Secao titulo="Horários">
        {erro && <Falha>{erro}</Falha>}
        {linhas === null ? (
          <Carregando />
        ) : linhas.length === 0 ? (
          <Vazio>Nenhum horário {modo === 'dia' ? 'nesse dia' : 'nessa semana'}.</Vazio>
        ) : (
          porDia.map(([chave, grupo]) => (
            <div key={chave} className="mb-6">
              {modo === 'semana' && (
                <p className="mt-6 mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted first-letter:uppercase">
                  {formatarDiaLongo(`${chave}T12:00:00-03:00`)}
                </p>
              )}
              <ul>
                {grupo.map((linha) => (
                  <LinhaAgenda key={linha.id} linha={linha} servicos={servicos} aoMudar={carregar} />
                ))}
              </ul>
            </div>
          ))
        )}
      </Secao>

      <Secao titulo="Indisponibilidades" descricao="Pausa, folga, férias ou trava por cima do expediente.">
        {bloqueios.length === 0 ? (
          <Vazio>Nenhuma no período.</Vazio>
        ) : (
          <ul>
            {bloqueios.map((bloqueio) => (
              <BloqueioLinha key={bloqueio.id} bloqueio={bloqueio} aoMudar={carregar} />
            ))}
          </ul>
        )}
      </Secao>

      <section>
        <Dobra titulo="Encaixar um horário">
          <Encaixe servicos={servicos} aoMudar={carregar} />
        </Dobra>
        <Dobra titulo="Nova indisponibilidade">
          <NovoBloqueio aoMudar={carregar} />
        </Dobra>
      </section>
    </Pagina>
  )
}

function BloqueioLinha({ bloqueio, aoMudar }: { bloqueio: Bloqueio; aoMudar: () => Promise<void> }) {
  const api = useApi()
  const [ocupado, setOcupado] = useState(false)
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-rule py-3 text-sm">
      <span className="text-ink">
        {rotuloMotivo(bloqueio.motivo)}
        <span className="text-muted">
          {' '}
          · {formatarDiaLongo(bloqueio.inicio)} · {formatarHorario(bloqueio.inicio)}–{formatarHorario(bloqueio.fim)}
        </span>
      </span>
      <Button
        variant="quiet"
        size="sm"
        ocupado={ocupado}
        onClick={async () => {
          setOcupado(true)
          await api.chamar(`/api/painel/bloqueios/${bloqueio.id}`, { metodo: 'DELETE' })
          setOcupado(false)
          await aoMudar()
        }}
      >
        Remover
      </Button>
    </li>
  )
}

const ERROS_ENCAIXE: Record<string, string> = {
  horario_indisponivel: 'Esse horário já está tomado.',
  servico_indisponivel: 'Esse serviço não está no catálogo.',
  pedido_invalido: 'Confira telefone, nome e data.',
  email_de_outra_ficha: 'Esse e-mail já está em outro telefone.',
}

function Encaixe({ servicos, aoMudar }: { servicos: ServicoBasico[]; aoMudar: () => Promise<void> }) {
  const api = useApi()
  const [telefone, setTelefone] = useState('')
  const [nome, setNome] = useState('')
  const [inicio, setInicio] = useState('')
  const [servicoIds, setServicoIds] = useState<string[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    if (!telefone.trim() || !nome.trim() || !inicio || servicoIds.length === 0) {
      setErro(ERROS_ENCAIXE.pedido_invalido)
      return
    }
    setOcupado(true)
    const resposta = await api.chamar<{ erro?: string }>('/api/painel/encaixe', {
      metodo: 'POST',
      corpo: { telefone, nome, inicio: new Date(inicio).toISOString(), servicoIds },
    })
    setOcupado(false)
    if (!resposta.ok) {
      setErro(ERROS_ENCAIXE[resposta.dados?.erro ?? ''] ?? 'Não foi possível gravar o encaixe.')
      return
    }
    setTelefone('')
    setNome('')
    setInicio('')
    setServicoIds([])
    await aoMudar()
  }

  return (
    <form onSubmit={enviar} className="grid gap-5 sm:grid-cols-2 max-w-2xl" noValidate>
      <Campo label="Telefone" inputMode="tel" autoComplete="off" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
      <Campo label="Nome" autoComplete="off" value={nome} onChange={(e) => setNome(e.target.value)} />
      <Campo label="Começa em" type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} />
      <Selecao
        label="Serviços"
        multiple
        value={servicoIds}
        onChange={(e) => setServicoIds([...e.target.selectedOptions].map((opcao) => opcao.value))}
        ajuda="Segure Ctrl ou ⌘ para mais de um."
        className="[&_select]:h-auto [&_select]:py-2 [&_select]:min-h-28"
      >
        {servicos.map((servico) => (
          <option key={servico.id} value={servico.id}>
            {servico.nome}
          </option>
        ))}
      </Selecao>
      <div className="sm:col-span-2 flex flex-col gap-3">
        <Falha>{erro}</Falha>
        <Button type="submit" ocupado={ocupado} className="self-start">
          Gravar encaixe
        </Button>
      </div>
    </form>
  )
}

function NovoBloqueio({ aoMudar }: { aoMudar: () => Promise<void> }) {
  const api = useApi()
  const [motivo, setMotivo] = useState('pausa')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    if (!inicio || !fim || inicio >= fim) {
      setErro('O fim precisa vir depois do começo.')
      return
    }
    setOcupado(true)
    const resposta = await api.chamar('/api/painel/bloqueios', {
      metodo: 'POST',
      corpo: { motivo, inicio: new Date(inicio).toISOString(), fim: new Date(fim).toISOString() },
    })
    setOcupado(false)
    if (!resposta.ok) {
      setErro('Não foi possível bloquear.')
      return
    }
    setInicio('')
    setFim('')
    await aoMudar()
  }

  return (
    <form onSubmit={enviar} className="grid gap-5 sm:grid-cols-3 max-w-2xl" noValidate>
      <Selecao label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
        <option value="pausa">Pausa</option>
        <option value="folga">Folga</option>
        <option value="ferias">Férias</option>
        <option value="trava">Trava</option>
      </Selecao>
      <Campo label="De" type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} />
      <Campo label="Até" type="datetime-local" value={fim} onChange={(e) => setFim(e.target.value)} />
      <div className="sm:col-span-3 flex flex-col gap-3">
        <Falha>{erro}</Falha>
        <Button type="submit" variant="outline" ocupado={ocupado} className="self-start">
          Bloquear
        </Button>
      </div>
    </form>
  )
}

export function SoEquipe() {
  return (
    <Pagina titulo="Só a equipe.">
      <p className="text-sm text-muted max-w-prose">Esta parte do app é da casa. A sua agenda está em Horários.</p>
    </Pagina>
  )
}
