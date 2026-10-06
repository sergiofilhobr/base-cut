'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  diaCivil,
  formatarDataCurta,
  formatarDiaLongo,
  formatarHorario,
  formatarPreco,
  rotuloEstado,
  somarDias,
} from '@/app/lib/agenda'
import { useApi } from '../sessao'
import { Button, classesDoBotao, cn } from '../ui/button'
import { Campo, Falha } from '../ui/campo'
import { Modal } from '../ui/modal'
import { EsqueletoLista, Estado, Pagina, Secao, Vazio } from '../ui/secao'
import { useFicha } from './eu'

type Horario = {
  id: string
  barbeiro: string
  inicio: string
  fim: string
  estado: string
  podeAlterar: boolean
  servicos: Array<{ id: string | null; nome: string; duracaoMinutos: number; precoCentavos: number }>
}

const ERROS: Record<string, string> = {
  prazo_encerrado: 'Faltam 2 horas ou menos. Só a casa altera daqui pra frente.',
  horario_indisponivel: 'Esse horário foi tomado. O seu continua o mesmo.',
  estado_invalido: 'Esse horário não está mais confirmado.',
  nao_encontrado: 'Não achamos esse horário na sua ficha.',
}

/** Horários — o próximo em destaque, os outros na fila, o passado embaixo. */
export function Horarios() {
  const api = useApi()
  const ficha = useFicha()
  const [lista, setLista] = useState<Horario[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(
    () =>
      api.chamar<{ agendamentos: Horario[] }>('/api/conta/agendamentos').then((resposta) => {
        if (!resposta.ok || !resposta.dados) {
          setErro('A agenda não respondeu.')
          setLista([])
          return
        }
        setErro(null)
        setLista(resposta.dados.agendamentos)
      }),
    [api],
  )

  useEffect(() => {
    void carregar()
  }, [carregar])

  const agora = new Date().toISOString()
  const futuros = (lista ?? [])
    .filter((item) => item.estado === 'confirmado' && item.inicio > agora)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
  const [proximo, ...fila] = futuros
  const passados = (lista ?? []).filter((item) => !futuros.includes(item))

  const primeiroNome = ficha?.nome.split(' ')[0] ?? ''

  return (
    <Pagina
      eyebrow={primeiroNome ? `Olá, ${primeiroNome}` : 'Sua agenda'}
      titulo={
        <>
          Seus
          <br />
          <span className="text-muted">horários.</span>
        </>
      }
      acao={
        <Link href="/app/marcar" className={classesDoBotao()}>
          Marcar horário
        </Link>
      }
    >
      {erro && <Falha>{erro}</Falha>}
      {lista === null ? (
        <EsqueletoLista />
      ) : (
        <>
          <Secao titulo="Próximo">
            {proximo ? (
              <ProximoHorario horario={proximo} aoMudar={carregar} />
            ) : (
              <Vazio>
                Nenhum horário marcado.{' '}
                <Link href="/app/marcar" className="text-ink border-b border-rule hover:border-ink">
                  Marcar agora
                </Link>
                .
              </Vazio>
            )}
          </Secao>

          <ProximaCorrida telefone={ficha?.telefone ?? null} />

          {fila.length > 0 && (
            <Secao titulo="Na fila">
              <ul className="list">
                {fila.map((item) => (
                  <LinhaCliente key={item.id} horario={item} aoMudar={carregar} />
                ))}
              </ul>
            </Secao>
          )}

          <Secao titulo="Histórico" descricao="O que já passou, e o que foi cancelado.">
            {passados.length === 0 ? (
              <Vazio>Ainda nada por aqui.</Vazio>
            ) : (
              <ul className="list">
                {passados.map((item) => (
                  <LinhaCliente key={item.id} horario={item} aoMudar={carregar} />
                ))}
              </ul>
            )}
          </Secao>
        </>
      )}
    </Pagina>
  )
}

function ProximoHorario({ horario, aoMudar }: { horario: Horario; aoMudar: () => Promise<void> }) {
  const total = horario.servicos.reduce((soma, item) => soma + item.precoCentavos, 0)
  return (
    <div className="grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-14">
      <div>
        <p className="font-display font-black uppercase leading-[0.85] tracking-[-0.03em] text-ink text-6xl sm:text-7xl tabular-nums">
          {formatarHorario(horario.inicio)}
        </p>
        <p className="mt-3 text-base text-ink first-letter:uppercase">{formatarDiaLongo(horario.inicio)}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          com {horario.barbeiro} · até {formatarHorario(horario.fim)}
        </p>
      </div>
      <div>
        <ul className="border-t-2 border-ink">
          {horario.servicos.map((item) => (
            <li key={`${item.id}-${item.nome}`} className="flex items-baseline justify-between gap-6 border-b border-rule py-3 text-sm">
              <span className="text-ink">{item.nome}</span>
              <span className="tabular-nums text-muted">{formatarPreco(item.precoCentavos)}</span>
            </li>
          ))}
          <li className="flex items-baseline justify-between gap-6 py-3 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Total</span>
            <span className="tabular-nums text-ink font-semibold">{formatarPreco(total)}</span>
          </li>
        </ul>
        <Acoes horario={horario} aoMudar={aoMudar} />
      </div>
    </div>
  )
}

function LinhaCliente({ horario, aoMudar }: { horario: Horario; aoMudar: () => Promise<void> }) {
  const vivo = horario.estado === 'confirmado'
  return (
    <li className={cn('list-row', !vivo && 'opacity-80')}>
      <p className="text-ink">
        <span className="font-display font-black text-xl leading-none tabular-nums">{formatarHorario(horario.inicio)}</span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          {formatarDataCurta(horario.inicio)}
        </span>
      </p>
      <div className="list-col-grow min-w-0">
        <p className="text-sm text-ink">
          {horario.servicos.map((item) => item.nome).join(' + ')}
          <span className="block text-muted">com {horario.barbeiro}</span>
        </p>
        <div className="mt-2">
          <Estado estado={horario.estado} rotulo={rotuloEstado(horario.estado)} />
        </div>
        {vivo && <Acoes horario={horario} aoMudar={aoMudar} compacta />}
      </div>
    </li>
  )
}

/** Cancelar e mudar o horário, na regra das 2 horas. */
function Acoes({ horario, aoMudar, compacta = false }: { horario: Horario; aoMudar: () => Promise<void>; compacta?: boolean }) {
  const api = useApi()
  const [modo, setModo] = useState<'nada' | 'cancelar' | 'mudar'>('nada')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [dia, setDia] = useState(diaCivil())
  const [horarios, setHorarios] = useState<string[] | null>(null)
  const [inicio, setInicio] = useState<string | null>(null)
  const hoje = diaCivil()

  if (!horario.podeAlterar) {
    return (
      <p className={cn('text-xs text-muted', compacta ? 'mt-2 sm:pl-[6.75rem]' : 'mt-4')}>
        Faltam 2 horas ou menos: só a casa altera.
      </p>
    )
  }

  async function cancelar() {
    setOcupado(true)
    setErro(null)
    const resposta = await api.chamar<{ erro?: string }>(`/api/conta/agendamentos/${horario.id}/cancelar`, {
      metodo: 'POST',
      corpo: {},
    })
    setOcupado(false)
    if (!resposta.ok) {
      setErro(ERROS[resposta.dados?.erro ?? ''] ?? 'Não foi possível cancelar.')
      return
    }
    setModo('nada')
    await aoMudar()
  }

  async function verHorarios(novoDia = dia) {
    const ids = horario.servicos.map((item) => item.id).filter(Boolean).join(',')
    const params = new URLSearchParams({ dia: novoDia, servicoIds: ids, exceto: horario.id })
    const resposta = await api.chamar<{ horarios: string[] }>(`/api/horarios?${params}`)
    setHorarios(resposta.dados?.horarios ?? [])
    setInicio(null)
  }

  async function reagendar() {
    if (!inicio) return
    setOcupado(true)
    setErro(null)
    const resposta = await api.chamar<{ erro?: string }>(`/api/conta/agendamentos/${horario.id}/reagendar`, {
      metodo: 'POST',
      corpo: { inicio },
    })
    setOcupado(false)
    if (!resposta.ok) {
      setErro(ERROS[resposta.dados?.erro ?? ''] ?? 'Não foi possível reagendar.')
      return
    }
    setModo('nada')
    setHorarios(null)
    await aoMudar()
  }

  return (
    <div className={cn(compacta ? 'mt-3 sm:pl-[6.75rem]' : 'mt-6')}>
      {modo === 'nada' && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size={compacta ? 'sm' : 'default'}
            onClick={() => {
              setModo('mudar')
              void verHorarios()
            }}
          >
            Mudar horário
          </Button>
          <Button variant="quiet" size={compacta ? 'sm' : 'default'} onClick={() => setModo('cancelar')}>
            Cancelar
          </Button>
        </div>
      )}

      <Modal aberto={modo === 'cancelar'} titulo="Cancelar horário" onFechar={() => setModo('nada')}>
        <p className="text-sm text-ink">Cancelar este horário? Não tem volta.</p>
        <Falha>{erro}</Falha>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" ocupado={ocupado} onClick={() => void cancelar()}>
            Sim, cancelar
          </Button>
          <Button variant="quiet" size="sm" onClick={() => setModo('nada')}>
            Manter
          </Button>
        </div>
      </Modal>

      {modo === 'mudar' && (
        <div className="max-w-md">
          <Campo
            label="Outro dia"
            type="date"
            value={dia}
            min={hoje}
            max={somarDias(hoje, 30)}
            onChange={(e) => {
              setDia(e.target.value)
              void verHorarios(e.target.value)
            }}
            ajuda="Os mesmos serviços, outro começo."
          />
          {horarios === null ? (
            <EsqueletoLista linhas={1} />
          ) : horarios.length === 0 ? (
            <Vazio>Nenhum horário livre nesse dia.</Vazio>
          ) : (
            <div className="join flex-wrap mt-2">
              {horarios.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  aria-pressed={inicio === opcao}
                  onClick={() => setInicio(opcao)}
                  className={cn(
                    'btn join-item btn-sm min-w-16 font-mono text-xs font-normal shadow-none',
                    inicio === opcao ? 'btn-primary' : 'btn-outline',
                  )}
                >
                  {formatarHorario(opcao)}
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={!inicio} ocupado={ocupado} onClick={() => void reagendar()}>
              Confirmar mudança
            </Button>
            <Button variant="quiet" onClick={() => setModo('nada')}>
              Deixar como está
            </Button>
          </div>
        </div>
      )}
      {erro && modo !== 'cancelar' && (
        <div className="mt-3">
          <Falha>{erro}</Falha>
        </div>
      )}
    </div>
  )
}

function ProximaCorrida({ telefone }: { telefone: string | null }) {
  const api = useApi()
  const [evento, setEvento] = useState<{ id: string; nome: string; inicio: string; vagas: number } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [feito, setFeito] = useState(false)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    void api.chamar<{ eventos: Array<{ id: string; nome: string; inicio: string; vagas: number }> }>('/api/run').then((resposta) => {
      const agora = new Date().toISOString()
      const proxima = (resposta.dados?.eventos ?? [])
        .filter((item) => item.inicio >= agora)
        .sort((a, b) => a.inicio.localeCompare(b.inicio))[0]
      setEvento(proxima ?? null)
    })
  }, [api])

  if (!evento) return null

  return (
    <Secao titulo="Próxima corrida" descricao="O Run Club da casa. A inscrição usa o telefone da sua ficha.">
      <p className="text-ink">
        {evento.nome}
        <span className="text-muted">
          {' '}
          · {formatarDiaLongo(evento.inicio)} · {formatarHorario(evento.inicio)} · {evento.vagas} vagas
        </span>
      </p>
      <div className="mt-4">
        <Falha>{erro}</Falha>
        {feito ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
            Você está na lista.
          </p>
        ) : (
          <Button
            variant="outline"
            disabled={!telefone}
            ocupado={ocupado}
            onClick={async () => {
              if (!telefone) return
              setErro(null)
              setOcupado(true)
              const resposta = await api.chamar<{ erro?: string }>(`/api/run/${evento.id}/inscrever`, {
                metodo: 'POST',
                corpo: { telefone },
              })
              setOcupado(false)
              if (!resposta.ok) {
                const codigo = resposta.dados?.erro
                setErro(
                  codigo === 'lista_cheia'
                    ? 'A lista fechou.'
                    : codigo === 'ja_inscrito'
                      ? 'Você já está nessa corrida.'
                      : 'Não foi possível inscrever.',
                )
                return
              }
              setFeito(true)
            }}
          >
            Inscrever
          </Button>
        )}
      </div>
    </Secao>
  )
}
