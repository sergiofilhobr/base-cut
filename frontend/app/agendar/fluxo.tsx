'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  diaCivil,
  formatarDiaLongo,
  formatarDuracao,
  formatarHorario,
  formatarPreco,
  somarDias,
  type BarbeiroAgenda,
  type ServicoAgenda,
} from '@/app/lib/agenda'

type Etapa = 'servicos' | 'profissional' | 'horario' | 'dados' | 'pronto'

type Confirmado = {
  id: string
  inicio: string
  fim: string
}

const ERROS: Record<string, string> = {
  horario_indisponivel: 'Esse horário acabou de ser ocupado. Escolha outro.',
  email_de_outra_ficha: 'Esse e-mail já está em outro telefone.',
  servico_indisponivel: 'Um dos serviços não está mais disponível.',
  sem_barbeiro: 'A agenda ainda não tem profissional.',
  pedido_invalido: 'Confira nome, telefone e e-mail.',
  sem_consentimento: 'A marcação pede o seu consentimento.',
}

export type FichaDoFluxo = { nome: string; telefone: string; email: string | null }

/**
 * Com `ficha`, o fluxo é o do cliente logado: não pede nome, telefone nem
 * e-mail, e o consentimento já foi dado no cadastro. Sem ela, é o público.
 */
export function FluxoAgendar({
  ficha,
  destinoAoConcluir,
}: {
  ficha?: FichaDoFluxo
  destinoAoConcluir?: string
} = {}) {
  const [etapa, setEtapa] = useState<Etapa>('servicos')
  const [servicos, setServicos] = useState<ServicoAgenda[] | null>(null)
  const [barbeiros, setBarbeiros] = useState<BarbeiroAgenda[]>([])
  const [escolhidos, setEscolhidos] = useState<string[]>([])
  const [barbeiroId, setBarbeiroId] = useState<string | null>(null)
  const [dia, setDia] = useState(diaCivil())
  const [horarios, setHorarios] = useState<string[]>([])
  const [inicio, setInicio] = useState<string | null>(null)
  const [nome, setNome] = useState(ficha?.nome ?? '')
  const [telefone, setTelefone] = useState(ficha?.telefone ?? '')
  const [email, setEmail] = useState(ficha?.email ?? '')
  const [consentimento, setConsentimento] = useState(Boolean(ficha))
  const [marketing, setMarketing] = useState(false)
  const [naEspera, setNaEspera] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [confirmado, setConfirmado] = useState<Confirmado | null>(null)
  const [apiFora, setApiFora] = useState(false)

  const hoje = diaCivil()
  const limite = somarDias(hoje, 30)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        const [respostaServicos, respostaBarbeiros] = await Promise.all([
          fetch('/api/servicos'),
          fetch('/api/barbeiros'),
        ])
        if (!respostaServicos.ok || !respostaBarbeiros.ok) throw new Error('api')
        const dadosServicos = (await respostaServicos.json()) as {
          servicos: ServicoAgenda[]
        }
        const dadosBarbeiros = (await respostaBarbeiros.json()) as {
          barbeiros: BarbeiroAgenda[]
        }
        if (!ativo) return
        setServicos(dadosServicos.servicos)
        setBarbeiros(dadosBarbeiros.barbeiros)
        if (dadosBarbeiros.barbeiros.length === 1) {
          setBarbeiroId(dadosBarbeiros.barbeiros[0].id)
        }
      } catch {
        if (ativo) setApiFora(true)
      }
    }
    void carregar()
    return () => {
      ativo = false
    }
  }, [])

  const duracao = useMemo(() => {
    if (!servicos) return 0
    return escolhidos.reduce((soma, id) => {
      const servico = servicos.find((item) => item.id === id)
      return soma + (servico?.duracaoMinutos ?? 0)
    }, 0)
  }, [escolhidos, servicos])

  const total = useMemo(() => {
    if (!servicos) return 0
    return escolhidos.reduce((soma, id) => {
      const servico = servicos.find((item) => item.id === id)
      return soma + (servico?.precoCentavos ?? 0)
    }, 0)
  }, [escolhidos, servicos])

  useEffect(() => {
    if (etapa !== 'horario' || escolhidos.length === 0) return
    let ativo = true
    const params = new URLSearchParams({
      dia,
      servicoIds: escolhidos.join(','),
    })
    if (barbeiroId) params.set('barbeiroId', barbeiroId)
    fetch(`/api/horarios?${params}`)
      .then(async (resposta) => {
        if (!resposta.ok) throw new Error('api')
        const dados = (await resposta.json()) as { horarios: string[] }
        if (ativo) {
          setHorarios(dados.horarios)
          setInicio(null)
        }
      })
      .catch(() => {
        if (ativo) setHorarios([])
      })
    return () => {
      ativo = false
    }
  }, [etapa, dia, escolhidos, barbeiroId])

  function alternarServico(id: string) {
    setEscolhidos((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id],
    )
  }

  function seguirDosServicos() {
    if (escolhidos.length === 0) return
    setEtapa(barbeiros.length > 1 ? 'profissional' : 'horario')
  }

  async function confirmar() {
    if (!inicio) return
    setEnviando(true)
    setErro(null)
    try {
      const resposta = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          servicoIds: escolhidos,
          inicio,
          nome,
          telefone,
          email,
          barbeiroId: barbeiroId ?? undefined,
          consentimento,
          marketing,
        }),
      })
      const dados = (await resposta.json()) as { erro?: string; id?: string; inicio?: string; fim?: string }
      if (!resposta.ok || !dados.id || !dados.inicio || !dados.fim) {
        setErro(ERROS[dados.erro ?? ''] ?? 'Não foi possível gravar. Tente de novo.')
        if (dados.erro === 'horario_indisponivel') {
          setEtapa('horario')
          setNaEspera(false)
        }
        return
      }
      setConfirmado({ id: dados.id, inicio: dados.inicio, fim: dados.fim })
      setEtapa('pronto')
    } catch {
      setErro('A agenda não respondeu. Tente de novo em instantes.')
    } finally {
      setEnviando(false)
    }
  }

  if (apiFora) {
    return (
      <p className="mt-10 max-w-xl text-base text-muted">
        A agenda não respondeu. A tabela de preços do site continua no ar; a
        marcação por aqui volta quando a API estiver de pé.
      </p>
    )
  }

  if (!servicos) {
    return <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-muted">Carregando a agenda.</p>
  }

  return (
    <div className="mt-10 max-w-xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {rotulo(etapa, barbeiros.length)}
      </p>

      {etapa === 'servicos' && (
        <div>
          <ul className="mt-6 border-t-2 border-ink">
            {servicos.map((servico) => {
              const marcado = escolhidos.includes(servico.id)
              return (
                <li key={servico.id} className="border-b border-rule">
                  <button
                    type="button"
                    onClick={() => alternarServico(servico.id)}
                    aria-pressed={marcado}
                    className="flex w-full items-baseline justify-between gap-4 py-4 text-left"
                  >
                    <span>
                      <span className="block text-sm text-ink">
                        <span className="mr-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                          {marcado ? 'Sim' : 'Não'}
                        </span>
                        {servico.nome}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                        {formatarDuracao(servico.duracaoMinutos)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-ink tabular-nums">
                      {formatarPreco(servico.precoCentavos)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {duracao > 0 ? `${formatarDuracao(duracao)} · ${formatarPreco(total)}` : 'Escolha um ou mais'}
          </p>
          <Botao onClick={seguirDosServicos} disabled={escolhidos.length === 0}>
            Ver horários
          </Botao>
        </div>
      )}

      {etapa === 'profissional' && (
        <ul className="mt-6 border-t-2 border-ink">
          {barbeiros.map((barbeiro) => (
            <li key={barbeiro.id} className="border-b border-rule">
              <button
                type="button"
                className="w-full py-4 text-left text-sm text-ink"
                onClick={() => {
                  setBarbeiroId(barbeiro.id)
                  setEtapa('horario')
                }}
              >
                {barbeiro.nome}
              </button>
            </li>
          ))}
        </ul>
      )}

      {etapa === 'horario' && (
        <div>
          <label className="mt-6 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Dia
            <input
              type="date"
              value={dia}
              min={hoje}
              max={limite}
              onChange={(evento) => setDia(evento.target.value)}
              className="input mt-2 w-full text-base"
            />
          </label>
          {horarios.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Nenhum horário livre nesse dia.</p>
          ) : (
            <ul className="mt-6 flex flex-wrap gap-2">
              {horarios.map((horario) => (
                <li key={horario}>
                  <button
                    type="button"
                    aria-pressed={inicio === horario}
                    onClick={() => setInicio(horario)}
                    className={`btn btn-sm min-w-16 font-mono text-xs font-normal shadow-none ${
                      inicio === horario ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    {formatarHorario(horario)}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {erro === ERROS.horario_indisponivel && inicio && (
            <button
              type="button"
              className="mt-4 text-sm text-ink underline"
              onClick={() => {
                void fetch('/api/espera', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    telefone,
                    servicoIds: escolhidos.join(','),
                    desejadoEm: inicio,
                  }),
                }).then(async (resposta) => {
                  if (resposta.status === 422) {
                    setErro('A lista de espera pede uma ficha. Marque um horário antes.')
                    return
                  }
                  if (!resposta.ok) {
                    setErro('Não entrou na lista. Tente de novo.')
                    return
                  }
                  setNaEspera(true)
                  setErro(null)
                })
              }}
            >
              Entrar na lista de espera
            </button>
          )}
          {naEspera && <p className="mt-3 text-sm text-ink">Você está na lista. A casa chama quando abrir.</p>}
          <Botao onClick={() => inicio && setEtapa('dados')} disabled={!inicio}>
            Seguir
          </Botao>
        </div>
      )}

      {etapa === 'dados' && inicio && ficha && (
        <div className="mt-6">
          <ul className="border-t-2 border-ink max-w-md">
            {servicos
              .filter((servico) => escolhidos.includes(servico.id))
              .map((servico) => (
                <li key={servico.id} className="flex items-baseline justify-between gap-6 border-b border-rule py-3 text-sm">
                  <span className="text-ink">{servico.nome}</span>
                  <span className="tabular-nums text-muted">{formatarPreco(servico.precoCentavos)}</span>
                </li>
              ))}
          </ul>
          <p className="mt-4 font-display text-3xl font-black uppercase leading-none text-ink">
            {formatarHorario(inicio)}
          </p>
          <p className="mt-2 text-sm capitalize text-muted">{formatarDiaLongo(inicio)}</p>
          <p className="mt-4 text-sm text-ink">
            Para {ficha.nome} · {ficha.telefone}
          </p>
          {erro && <p className="mt-4 text-sm text-ink">{erro}</p>}
          <div className="flex flex-wrap items-center gap-4">
            <Botao onClick={() => void confirmar()} disabled={enviando}>
              {enviando ? 'Gravando' : 'Confirmar horário'}
            </Botao>
            <button
              type="button"
              onClick={() => setEtapa('horario')}
              className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted underline-offset-4 hover:underline"
            >
              Outro horário
            </button>
          </div>
        </div>
      )}

      {etapa === 'dados' && inicio && !ficha && (
        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(evento) => {
            evento.preventDefault()
            void confirmar()
          }}
        >
          <Campo label="Nome" value={nome} onChange={setNome} autoComplete="name" />
          <Campo
            label="Telefone"
            value={telefone}
            onChange={setTelefone}
            autoComplete="tel"
            inputMode="tel"
          />
          <Campo
            label="E-mail"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            type="email"
          />
          <label className="flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={consentimento}
              onChange={(evento) => setConsentimento(evento.target.checked)}
              className="checkbox checkbox-sm mt-0.5"
            />
            Concordo em guardar nome, telefone e e-mail para marcar e lembrar este horário.
          </label>
          <label className="flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(evento) => setMarketing(evento.target.checked)}
              className="checkbox checkbox-sm mt-0.5"
            />
            Quero receber campanha e oferta. Posso sair quando quiser.
          </label>
          {erro && <p className="text-sm text-ink">{erro}</p>}
          <Botao
            type="submit"
            disabled={enviando || !consentimento || !nome.trim() || !telefone.trim() || !email.trim()}
          >
            {enviando ? 'Gravando' : 'Confirmar horário'}
          </Botao>
        </form>
      )}

      {etapa === 'pronto' && confirmado && (
        <div className="mt-6">
          <p className="font-display text-4xl font-black uppercase leading-none text-ink">
            {formatarHorario(confirmado.inicio)}
          </p>
          <p className="mt-3 text-sm capitalize text-muted">{formatarDiaLongo(confirmado.inicio)}</p>
          <p className="mt-6 text-sm text-ink">
            Horário confirmado. Até lá, na base.
          </p>
          <Link
            href={destinoAoConcluir ?? `/agendamento/${confirmado.id}`}
            className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.2em] text-ink underline"
          >
            {destinoAoConcluir ? 'Ver meus horários' : 'Cancelar ou mudar o horário'}
          </Link>
        </div>
      )}
    </div>
  )
}

function rotulo(etapa: Etapa, quantidadeDeBarbeiros: number) {
  if (etapa === 'servicos') return 'Serviços'
  if (etapa === 'profissional') return 'Profissional'
  if (etapa === 'horario') return 'Horário'
  if (etapa === 'dados') return 'Seus dados'
  return quantidadeDeBarbeiros > 1 ? 'Confirmado' : 'Confirmado'
}

function Botao({
  children,
  disabled,
  onClick,
  type = 'button',
}: {
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="btn btn-primary btn-lg mt-8 px-8 font-mono text-xs font-normal uppercase tracking-[0.2em] shadow-none"
    >
      {children}
    </button>
  )
}

function Campo({
  label,
  value,
  onChange,
  autoComplete,
  type = 'text',
  inputMode,
}: {
  label: string
  value: string
  onChange: (valor: string) => void
  autoComplete: string
  type?: string
  inputMode?: 'tel' | 'text'
}) {
  return (
    <fieldset className="fieldset p-0">
      <legend className="fieldset-legend pb-1.5 font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-muted">
        {label}
      </legend>
      <input
        required
        aria-label={label}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        className="input w-full text-base"
      />
    </fieldset>
  )
}
