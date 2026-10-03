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

export function FluxoAgendar() {
  const [etapa, setEtapa] = useState<Etapa>('servicos')
  const [servicos, setServicos] = useState<ServicoAgenda[] | null>(null)
  const [barbeiros, setBarbeiros] = useState<BarbeiroAgenda[]>([])
  const [escolhidos, setEscolhidos] = useState<string[]>([])
  const [barbeiroId, setBarbeiroId] = useState<string | null>(null)
  const [dia, setDia] = useState(diaCivil())
  const [horarios, setHorarios] = useState<string[]>([])
  const [inicio, setInicio] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [consentimento, setConsentimento] = useState(false)
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
        }),
      })
      const dados = (await resposta.json()) as { erro?: string; id?: string; inicio?: string; fim?: string }
      if (!resposta.ok || !dados.id || !dados.inicio || !dados.fim) {
        setErro(ERROS[dados.erro ?? ''] ?? 'Não foi possível gravar. Tente de novo.')
        if (dados.erro === 'horario_indisponivel') setEtapa('horario')
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
              className="mt-2 block w-full border-b border-ink bg-transparent py-3 text-base text-ink"
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
                    className={`min-h-11 min-w-16 px-3 py-2 font-mono text-xs ${
                      inicio === horario ? 'bg-ink text-paper' : 'border border-rule text-ink'
                    }`}
                  >
                    {formatarHorario(horario)}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Botao onClick={() => inicio && setEtapa('dados')} disabled={!inicio}>
            Seguir
          </Botao>
        </div>
      )}

      {etapa === 'dados' && inicio && (
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
              className="mt-1"
            />
            Concordo em guardar nome, telefone e e-mail para marcar e lembrar este horário.
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
            href={`/agendamento/${confirmado.id}`}
            className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.2em] text-ink underline"
          >
            Cancelar ou mudar o horário
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
      className="
        mt-8 inline-flex min-h-12 items-center px-8 py-4
        font-mono text-xs uppercase tracking-[0.2em]
        bg-ink text-paper
        disabled:opacity-40
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
        focus-visible:outline-ink
      "
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
    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
      {label}
      <input
        required
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        className="mt-2 block w-full border-b border-ink bg-transparent py-3 text-base text-ink outline-none"
      />
    </label>
  )
}
