'use client'

import { ClerkProvider, SignIn, useAuth } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'
import { diaCivil, formatarHorario, somarDias } from '@/app/lib/agenda'
import { Button } from './ui/button'

type Linha = {
  id: string
  nome: string
  telefone: string
  inicio: string
  fim: string
  estado: string
  servicos: Array<{ id: string | null; nome: string }>
}

type Bloqueio = { id: string; inicio: string; fim: string; motivo: string }
type Servico = { id: string; nome: string }

export function Painel() {
  const chave = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!chave) return null
  return (
    <ClerkProvider publishableKey={chave}>
      <Agenda />
    </ClerkProvider>
  )
}

function Agenda() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [modo, setModo] = useState<'dia' | 'semana'>('dia')
  const [dia, setDia] = useState(diaCivil())
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [aviso, setAviso] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    const { de, ate } = intervalo(dia, modo)
    const resposta = await fetch(`/api/painel/agenda?de=${encodeURIComponent(de)}&ate=${encodeURIComponent(ate)}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    if (!resposta.ok) {
      setAviso('A agenda não abriu. A conta precisa ser da equipe.')
      return
    }
    const dados = (await resposta.json()) as { agendamentos: Linha[]; bloqueios: Bloqueio[] }
    setLinhas(dados.agendamentos)
    setBloqueios(dados.bloqueios)
    setAviso(null)
  }, [dia, getToken, modo])

  useEffect(() => {
    if (isSignedIn) void carregar()
  }, [carregar, isSignedIn])

  useEffect(() => {
    if (!isSignedIn) return
    const desde = new Date().toISOString()
    const vistos = new Set<string>()
    const timer = window.setInterval(async () => {
      const token = await getToken()
      if (!token || Notification.permission !== 'granted') return
      const resposta = await fetch(`/api/painel/novos?desde=${encodeURIComponent(desde)}`, {
        headers: { authorization: `Bearer ${token}` },
      })
      if (!resposta.ok) return
      const dados = (await resposta.json()) as { agendamentos: Linha[] }
      let chegou = false
      for (const linha of dados.agendamentos) {
        if (vistos.has(linha.id)) continue
        vistos.add(linha.id)
        chegou = true
        new Notification('Horário novo', {
          body: `${linha.nome} · ${formatarHorario(linha.inicio)}`,
        })
      }
      if (chegou) void carregar()
    }, 20000)
    return () => window.clearInterval(timer)
  }, [carregar, getToken, isSignedIn])

  useEffect(() => {
    void fetch('/api/servicos')
      .then((resposta) => resposta.json())
      .then((dados: { servicos: Servico[] }) => setServicos(dados.servicos))
      .catch(() => setServicos([]))
  }, [])

  if (!isLoaded) return <p className="mt-8 text-sm text-muted">Abrindo.</p>
  if (!isSignedIn) {
    return (
      <div className="mt-8">
        <SignIn routing="hash" />
      </div>
    )
  }

  return (
    <div className="mt-6 max-w-lg">
      <div className="flex gap-2">
        <Button variant={modo === 'dia' ? 'default' : 'outline'} onClick={() => setModo('dia')}>
          Dia
        </Button>
        <Button variant={modo === 'semana' ? 'default' : 'outline'} onClick={() => setModo('semana')}>
          Semana
        </Button>
        <Button
          variant="outline"
          onClick={() => void Notification.requestPermission()}
        >
          Avisos
        </Button>
      </div>
      <label className="mt-4 block text-sm text-muted">
        Dia
        <input
          type="date"
          value={dia}
          onChange={(evento) => setDia(evento.target.value)}
          className="mt-1 block w-full border-b border-ink bg-transparent py-2 text-ink"
        />
      </label>
      {aviso && <p className="mt-4 text-sm text-ink">{aviso}</p>}

      <ul className="mt-6 border-t-2 border-ink">
        {linhas.map((linha) => (
          <LinhaDaAgenda
            key={linha.id}
            linha={linha}
            servicos={servicos}
            token={getToken}
            aoMudar={carregar}
          />
        ))}
        {bloqueios.map((bloqueio) => (
          <li key={bloqueio.id} className="border-b border-rule py-3 text-sm text-muted">
            {rotuloMotivo(bloqueio.motivo)} · {formatarHorario(bloqueio.inicio)}–{formatarHorario(bloqueio.fim)}
          </li>
        ))}
      </ul>

      <Encaixe servicos={servicos} token={getToken} aoMudar={carregar} />
      <BloqueioForm token={getToken} aoMudar={carregar} />
      <Expediente token={getToken} />
      <CorteBooksy token={getToken} />
    </div>
  )
}

function LinhaDaAgenda({
  linha,
  servicos,
  token,
  aoMudar,
}: {
  linha: Linha
  servicos: Servico[]
  token: () => Promise<string | null>
  aoMudar: () => Promise<void>
}) {
  const [inicio, setInicio] = useState(linha.inicio.slice(0, 16))
  const [escolhidos, setEscolhidos] = useState(
    linha.servicos.map((servico) => servico.id).filter((id): id is string => Boolean(id)),
  )

  async function post(caminho: string, corpo: unknown) {
    const autorizacao = await token()
    if (!autorizacao) return
    await fetch(caminho, {
      method: 'POST',
      headers: { authorization: `Bearer ${autorizacao}`, 'content-type': 'application/json' },
      body: JSON.stringify(corpo),
    })
    await aoMudar()
  }

  return (
    <li className="border-b border-rule py-4">
      <p className="text-sm text-ink">
        {formatarHorario(linha.inicio)} · {linha.nome}
      </p>
      <p className="mt-1 text-sm text-muted">{linha.telefone}</p>
      <p className="mt-1 text-sm text-ink">{linha.servicos.map((servico) => servico.nome).join(', ')}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{linha.estado}</p>
      {linha.estado === 'confirmado' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void post(`/api/painel/agendamentos/${linha.id}/estado`, { estado: 'concluido' })}>
            Concluído
          </Button>
          <Button size="sm" variant="outline" onClick={() => void post(`/api/painel/agendamentos/${linha.id}/estado`, { estado: 'falta' })}>
            Falta
          </Button>
          <Button size="sm" variant="outline" onClick={() => void post(`/api/painel/agendamentos/${linha.id}/estado`, { estado: 'cancelado_pela_casa' })}>
            Cancelar
          </Button>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="datetime-local"
              value={inicio}
              onChange={(evento) => setInicio(evento.target.value)}
              className="border-b border-ink bg-transparent py-1 text-ink"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => void post(`/api/painel/agendamentos/${linha.id}/mover`, { inicio: new Date(inicio).toISOString() })}
            >
              Mover
            </Button>
          </label>
          <div className="flex w-full flex-col gap-1">
            {servicos.map((servico) => (
              <label key={servico.id} className="text-sm text-ink">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={escolhidos.includes(servico.id)}
                  onChange={() =>
                    setEscolhidos((atual) =>
                      atual.includes(servico.id)
                        ? atual.filter((id) => id !== servico.id)
                        : [...atual, servico.id],
                    )
                  }
                />
                {servico.nome}
              </label>
            ))}
            <Button
              size="sm"
              variant="outline"
              disabled={escolhidos.length === 0}
              onClick={() => void post(`/api/painel/agendamentos/${linha.id}/servicos`, { servicoIds: escolhidos })}
            >
              Salvar serviços
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}

function Encaixe({
  servicos,
  token,
  aoMudar,
}: {
  servicos: Servico[]
  token: () => Promise<string | null>
  aoMudar: () => Promise<void>
}) {
  const [telefone, setTelefone] = useState('')
  const [nome, setNome] = useState('')
  const [inicio, setInicio] = useState('')
  const [servicoId, setServicoId] = useState('')

  return (
    <form
      className="mt-10 flex flex-col gap-3"
      onSubmit={async (evento) => {
        evento.preventDefault()
        const autorizacao = await token()
        if (!autorizacao || !telefone.trim()) return
        await fetch('/api/painel/encaixe', {
          method: 'POST',
          headers: { authorization: `Bearer ${autorizacao}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            telefone,
            nome,
            inicio: new Date(inicio).toISOString(),
            servicoIds: [servicoId],
          }),
        })
        setTelefone('')
        await aoMudar()
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Encaixe</p>
      <input required placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="border-b border-ink bg-transparent py-2 text-ink" />
      <input required placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="border-b border-ink bg-transparent py-2 text-ink" />
      <input required type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border-b border-ink bg-transparent py-2 text-ink" />
      <select required value={servicoId} onChange={(e) => setServicoId(e.target.value)} className="border-b border-ink bg-transparent py-2 text-ink">
        <option value="">Serviço</option>
        {servicos.map((servico) => (
          <option key={servico.id} value={servico.id}>{servico.nome}</option>
        ))}
      </select>
      <Button type="submit" disabled={!telefone.trim()}>Gravar encaixe</Button>
    </form>
  )
}

function BloqueioForm({
  token,
  aoMudar,
}: {
  token: () => Promise<string | null>
  aoMudar: () => Promise<void>
}) {
  const [motivo, setMotivo] = useState('pausa')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')

  return (
    <form
      className="mt-10 flex flex-col gap-3"
      onSubmit={async (evento) => {
        evento.preventDefault()
        const autorizacao = await token()
        if (!autorizacao) return
        await fetch('/api/painel/bloqueios', {
          method: 'POST',
          headers: { authorization: `Bearer ${autorizacao}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            motivo,
            inicio: new Date(inicio).toISOString(),
            fim: new Date(fim).toISOString(),
          }),
        })
        await aoMudar()
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Pausa, folga, férias ou trava</p>
      <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="border-b border-ink bg-transparent py-2 text-ink">
        <option value="pausa">Pausa</option>
        <option value="folga">Folga</option>
        <option value="ferias">Férias</option>
        <option value="trava">Trava</option>
      </select>
      <input required type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border-b border-ink bg-transparent py-2 text-ink" />
      <input required type="datetime-local" value={fim} onChange={(e) => setFim(e.target.value)} className="border-b border-ink bg-transparent py-2 text-ink" />
      <Button type="submit" variant="outline">Bloquear</Button>
    </form>
  )
}

function Expediente({ token }: { token: () => Promise<string | null> }) {
  const [inicio, setInicio] = useState('09:00')
  const [fim, setFim] = useState('19:00')
  const [salvo, setSalvo] = useState(false)

  return (
    <form
      className="mt-10 flex flex-col gap-3"
      onSubmit={async (evento) => {
        evento.preventDefault()
        const autorizacao = await token()
        if (!autorizacao) return
        const faixas = [2, 3, 4, 5, 6].map((diaSemana) => ({
          diaSemana,
          inicio,
          fim: diaSemana === 6 ? '17:00' : fim,
        }))
        const resposta = await fetch('/api/expediente', {
          method: 'PUT',
          headers: { authorization: `Bearer ${autorizacao}`, 'content-type': 'application/json' },
          body: JSON.stringify({ faixas }),
        })
        setSalvo(resposta.ok)
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Expediente, terça a sábado</p>
      <input value={inicio} onChange={(e) => setInicio(e.target.value)} className="border-b border-ink bg-transparent py-2 text-ink" />
      <input value={fim} onChange={(e) => setFim(e.target.value)} className="border-b border-ink bg-transparent py-2 text-ink" />
      <Button type="submit" variant="outline">Salvar expediente</Button>
      {salvo && <p className="text-sm text-muted">Expediente gravado.</p>}
    </form>
  )
}

function intervalo(dia: string, modo: 'dia' | 'semana') {
  const inicio = new Date(`${dia}T00:00:00-03:00`)
  if (modo === 'dia') {
    return { de: inicio.toISOString(), ate: new Date(inicio.getTime() + 24 * 60 * 60 * 1000).toISOString() }
  }
  const meioDia = new Date(`${dia}T12:00:00-03:00`)
  const domingoZero = meioDia.getUTCDay()
  const iso = domingoZero === 0 ? 7 : domingoZero
  const segunda = somarDias(dia, 1 - iso)
  const de = new Date(`${segunda}T00:00:00-03:00`)
  return { de: de.toISOString(), ate: new Date(de.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() }
}

function CorteBooksy({ token }: { token: () => Promise<string | null> }) {
  const [csv, setCsv] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)

  async function autorizar() {
    const autorizacao = await token()
    return autorizacao
  }

  return (
    <div className="mt-10 flex flex-col gap-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        Corte do Booksy
      </p>
      <textarea
        value={csv}
        onChange={(evento) => setCsv(evento.target.value)}
        placeholder="nome,telefone,email"
        className="min-h-24 border-b border-ink bg-transparent py-2 text-sm text-ink"
      />
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          const autorizacao = await autorizar()
          if (!autorizacao || !csv.trim()) return
          const resposta = await fetch('/api/painel/importacao/booksy', {
            method: 'POST',
            headers: { authorization: `Bearer ${autorizacao}`, 'content-type': 'text/csv' },
            body: csv,
          })
          const dados = (await resposta.json()) as { criados?: number; existentes?: number }
          if (resposta.ok) setAviso(`${dados.criados ?? 0} fichas novas, ${dados.existentes ?? 0} já estavam.`)
        }}
      >
        Importar CSV
      </Button>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            const autorizacao = await autorizar()
            if (!autorizacao) return
            await fetch('/api/painel/casa', {
              method: 'PUT',
              headers: { authorization: `Bearer ${autorizacao}`, 'content-type': 'application/json' },
              body: JSON.stringify({ agendamento: 'site' }),
            })
            setAviso('O link público aponta para o site. O Booksy deixa de ser o destino.')
          }}
        >
          Abrir no site
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            const autorizacao = await autorizar()
            if (!autorizacao) return
            await fetch('/api/painel/casa', {
              method: 'PUT',
              headers: { authorization: `Bearer ${autorizacao}`, 'content-type': 'application/json' },
              body: JSON.stringify({ agendamento: 'booksy' }),
            })
            setAviso('O link público voltou para o Booksy.')
          }}
        >
          Voltar ao Booksy
        </Button>
      </div>
      {aviso && <p className="text-sm text-muted">{aviso}</p>}
    </div>
  )
}

function rotuloMotivo(motivo: string) {
  if (motivo === 'pausa') return 'Pausa'
  if (motivo === 'folga') return 'Folga'
  if (motivo === 'ferias') return 'Férias'
  return 'Trava'
}
