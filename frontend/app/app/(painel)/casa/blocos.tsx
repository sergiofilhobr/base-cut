'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { formatarDiaLongo, formatarHorario, formatarPreco, reaisParaCentavos, rotuloEstado } from '@/app/lib/agenda'
import { useApi } from '../../sessao'
import { Button } from '../../ui/button'
import { AreaDeTexto, Campo, Falha, Selecao } from '../../ui/campo'
import { EsqueletoLista, Vazio } from '../../ui/secao'

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export function Bloco({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao?: string
  children: ReactNode
}) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend font-display font-black uppercase tracking-tight text-xl text-ink px-0">
        {titulo}
      </legend>
      {descricao && <p className="mb-4 max-w-prose text-sm text-muted">{descricao}</p>}
      {children}
    </fieldset>
  )
}

type Produto = { id: string; nome: string; precoCentavos: number; estoque: number }

export function Produtos() {
  const api = useApi()
  const [lista, setLista] = useState<Produto[] | null>(null)
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [estoque, setEstoque] = useState('0')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    void api.chamar<{ produtos: Produto[] }>('/api/painel/produtos').then((resposta) => {
      setLista(resposta.dados?.produtos ?? [])
    })
  }, [api, versao])

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const centavos = reaisParaCentavos(preco)
    const unidades = Number(estoque)
    if (!nome.trim() || centavos === null || centavos < 0 || !Number.isInteger(unidades) || unidades < 0) {
      setErro('Nome, preço em reais e estoque inteiro.')
      return
    }
    setErro(null)
    setOcupado(true)
    const resposta = await api.chamar('/api/painel/produtos', {
      metodo: 'POST',
      corpo: { nome: nome.trim(), precoCentavos: centavos, estoque: unidades },
    })
    setOcupado(false)
    if (!resposta.ok) {
      setErro('O produto não entrou.')
      return
    }
    setNome('')
    setPreco('')
    setEstoque('0')
    setVersao((atual) => atual + 1)
  }

  return (
    <Bloco titulo="Produtos" descricao="O que a cadeira vende junto com o corte. O estoque baixa no fechamento.">
      {lista === null ? (
        <EsqueletoLista linhas={2} />
      ) : lista.length === 0 ? (
        <Vazio>Nenhum produto cadastrado.</Vazio>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
                <th>Estoque</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.nome}</td>
                  <td className="tabular-nums">{formatarPreco(produto.precoCentavos)}</td>
                  <td className="tabular-nums">{produto.estoque}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form onSubmit={enviar} className="mt-6 grid gap-4 sm:grid-cols-3 max-w-2xl" noValidate>
        <Campo label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Campo label="Preço" inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="45,00" />
        <Campo label="Estoque" inputMode="numeric" value={estoque} onChange={(e) => setEstoque(e.target.value)} />
        <div className="sm:col-span-3 flex flex-col gap-3">
          <Falha>{erro}</Falha>
          <Button type="submit" variant="outline" ocupado={ocupado} className="self-start">
            Cadastrar
          </Button>
        </div>
      </form>
    </Bloco>
  )
}

type Plano = { id: string; nome: string; valorCentavos: number }

export function Planos() {
  const api = useApi()
  const [telefone, setTelefone] = useState('')
  const [clienteId, setClienteId] = useState<string | null>(null)
  const [clienteNome, setClienteNome] = useState<string | null>(null)
  const [planos, setPlanos] = useState<Plano[]>([])
  const [nome, setNome] = useState('Mensal')
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)

  async function buscar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setOcupado('buscar')
    const resposta = await api.chamar<{ cliente: { id: string; nome: string }; planos: Plano[] }>(
      `/api/painel/clientes?telefone=${encodeURIComponent(telefone)}`,
    )
    setOcupado(null)
    if (!resposta.ok || !resposta.dados) {
      setClienteId(null)
      setClienteNome(null)
      setPlanos([])
      setErro(resposta.status === 404 ? 'Não há ficha com esse telefone.' : 'A ficha não abriu.')
      return
    }
    setClienteId(resposta.dados.cliente.id)
    setClienteNome(resposta.dados.cliente.nome)
    setPlanos(resposta.dados.planos)
  }

  async function criar(evento: FormEvent) {
    evento.preventDefault()
    const centavos = reaisParaCentavos(valor)
    if (!clienteId || !nome.trim() || centavos === null || centavos <= 0) {
      setErro('Ache a ficha e informe nome e valor.')
      return
    }
    setErro(null)
    setOcupado('criar')
    const resposta = await api.chamar('/api/painel/planos', {
      metodo: 'POST',
      corpo: { clienteId, nome: nome.trim(), valorCentavos: centavos },
    })
    setOcupado(null)
    if (!resposta.ok) {
      setErro('O plano não entrou.')
      return
    }
    setValor('')
    const atual = await api.chamar<{ planos: Plano[] }>(`/api/painel/planos?clienteId=${encodeURIComponent(clienteId)}`)
    setPlanos(atual.dados?.planos ?? [])
  }

  return (
    <Bloco titulo="Planos" descricao="O plano fica na ficha do cliente, com nome e valor.">
      <form onSubmit={buscar} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] max-w-md items-start" noValidate>
        <Campo label="Telefone" inputMode="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <Button type="submit" variant="outline" ocupado={ocupado === 'buscar'} className="sm:mt-[1.4rem]">
          Buscar
        </Button>
      </form>
      {clienteNome && <p className="mt-2 text-sm text-ink">{clienteNome}</p>}
      {planos.length > 0 && (
        <ul className="list mt-2">
          {planos.map((plano) => (
            <li key={plano.id} className="list-row">
              <span className="list-col-grow">{plano.nome}</span>
              <span className="tabular-nums">{formatarPreco(plano.valorCentavos)}</span>
            </li>
          ))}
        </ul>
      )}
      {clienteId && (
        <form onSubmit={criar} className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem_auto] items-start max-w-xl" noValidate>
          <Campo label="Nome do plano" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Campo label="Valor" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
          <Button type="submit" variant="outline" ocupado={ocupado === 'criar'} className="sm:mt-[1.4rem]">
            Gravar
          </Button>
        </form>
      )}
      <div className="mt-3">
        <Falha>{erro}</Falha>
      </div>
    </Bloco>
  )
}

export function Campanha() {
  const api = useApi()
  const [nome, setNome] = useState('')
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [resumo, setResumo] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!nome.trim() || !texto.trim()) {
      setErro('Nome e texto da mensagem.')
      return
    }
    setErro(null)
    setResumo(null)
    setOcupado(true)
    const resposta = await api.chamar<{ destinatarios: number; enviados: number; canal: boolean }>('/api/painel/campanhas', {
      metodo: 'POST',
      corpo: { nome: nome.trim(), texto: texto.trim() },
    })
    setOcupado(false)
    if (!resposta.ok || !resposta.dados) {
      setErro('A campanha não saiu.')
      return
    }
    const { destinatarios, enviados, canal } = resposta.dados
    setResumo(
      canal
        ? `${enviados} de ${destinatarios} com opt-in receberam no WhatsApp.`
        : `${destinatarios} com opt-in. O canal do WhatsApp está desligado, nada foi enviado.`,
    )
    setNome('')
    setTexto('')
  }

  return (
    <Bloco titulo="Campanha" descricao="Só quem aceitou receber. O texto sai pelo WhatsApp da casa.">
      <form onSubmit={enviar} className="flex flex-col gap-4 max-w-xl" noValidate>
        <Campo label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Quinta vazia" />
        <AreaDeTexto label="Texto" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <Falha>{erro}</Falha>
        {resumo && (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
            {resumo}
          </p>
        )}
        <Button type="submit" variant="outline" ocupado={ocupado} className="self-start">
          Enviar
        </Button>
      </form>
    </Bloco>
  )
}

type FichaPainel = {
  cliente: {
    id: string
    nome: string
    telefone: string
    email: string | null
    pontos: number
    observacao: string | null
    runClub: boolean
    optIn: boolean
  }
  historico: Array<{ id: string; barbeiro: string; inicio: string; estado: string; servicos: string[] }>
  planos: Array<{ id: string; nome: string; valorCentavos: number }>
}

export function FichaDaCasa() {
  const api = useApi()
  const [telefone, setTelefone] = useState('')
  const [ficha, setFicha] = useState<FichaPainel | null>(null)
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)

  async function buscar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setOcupado('buscar')
    const resposta = await api.chamar<FichaPainel>(`/api/painel/clientes?telefone=${encodeURIComponent(telefone)}`)
    setOcupado(null)
    if (!resposta.ok || !resposta.dados) {
      setFicha(null)
      setErro(resposta.status === 404 ? 'Não há ficha com esse telefone.' : 'A ficha não abriu.')
      return
    }
    setFicha(resposta.dados)
    setObservacao(resposta.dados.cliente.observacao ?? '')
  }

  async function gravar(evento: FormEvent) {
    evento.preventDefault()
    if (!ficha) return
    setErro(null)
    setOcupado('gravar')
    const resposta = await api.chamar(`/api/painel/clientes/${ficha.cliente.id}`, {
      metodo: 'PUT',
      corpo: { observacao },
    })
    setOcupado(null)
    if (!resposta.ok) setErro('A observação não gravou.')
  }

  return (
    <Bloco titulo="Ficha" descricao="Histórico, pontos, plano e o que a casa anota sobre a pessoa.">
      <form onSubmit={buscar} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] max-w-md items-start" noValidate>
        <Campo label="Telefone" inputMode="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <Button type="submit" variant="outline" ocupado={ocupado === 'buscar'} className="sm:mt-[1.4rem]">
          Abrir
        </Button>
      </form>
      <Falha>{erro}</Falha>
      {ficha && (
        <div className="mt-6 flex flex-col gap-6">
          <p className="text-ink">
            {ficha.cliente.nome}
            <span className="text-muted">
              {' '}
              · {ficha.cliente.pontos} pontos
              {ficha.cliente.runClub ? ' · Run Club' : ''}
              {ficha.cliente.optIn ? ' · recebe campanha' : ''}
            </span>
          </p>
          {ficha.planos.length === 0 ? (
            <Vazio>Sem plano.</Vazio>
          ) : (
            <ul className="list">
              {ficha.planos.map((plano) => (
                <li key={plano.id} className="list-row">
                  <span className="list-col-grow">{plano.nome}</span>
                  <span className="tabular-nums">{formatarPreco(plano.valorCentavos)}</span>
                </li>
              ))}
            </ul>
          )}
          {ficha.historico.length === 0 ? (
            <Vazio>Sem horários na ficha.</Vazio>
          ) : (
            <ul className="list">
              {ficha.historico.map((item) => (
                <li key={item.id} className="list-row">
                  <div>
                    <p className="font-display font-black text-xl tabular-nums">{formatarHorario(item.inicio)}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">{formatarDiaLongo(item.inicio)}</p>
                  </div>
                  <div className="list-col-grow">
                    <p>{item.servicos.join(' + ') || 'Sem serviço'}</p>
                    <p className="text-sm text-muted">
                      {item.barbeiro} · {rotuloEstado(item.estado)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={gravar} className="max-w-xl flex flex-col gap-3" noValidate>
            <AreaDeTexto label="Observação" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            <Button type="submit" variant="outline" ocupado={ocupado === 'gravar'} className="self-start">
              Gravar observação
            </Button>
          </form>
          <Recorrencia clienteId={ficha.cliente.id} />
        </div>
      )}
    </Bloco>
  )
}

function Recorrencia({ clienteId }: { clienteId: string }) {
  const api = useApi()
  const [diaSemana, setDiaSemana] = useState('6')
  const [hora, setHora] = useState('10:00')
  const [servicoIds, setServicoIds] = useState('')
  const [servicos, setServicos] = useState<Array<{ id: string; nome: string }>>([])
  const [proxima, setProxima] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    void api.chamar<{ servicos: Array<{ id: string; nome: string }> }>('/api/servicos').then((resposta) => {
      setServicos(resposta.dados?.servicos ?? [])
    })
  }, [api])

  return (
    <form
      className="grid gap-4 sm:grid-cols-2 max-w-xl"
      noValidate
      onSubmit={async (evento) => {
        evento.preventDefault()
        if (!servicoIds) {
          setErro('Escolha o serviço que volta.')
          return
        }
        setErro(null)
        setOcupado(true)
        const resposta = await api.chamar<{ proxima: string | null }>('/api/painel/recorrencias', {
          metodo: 'POST',
          corpo: { clienteId, servicoIds, diaSemana: Number(diaSemana), hora },
        })
        setOcupado(false)
        if (!resposta.ok) {
          setErro('A recorrência não entrou.')
          return
        }
        setProxima(resposta.dados?.proxima ?? null)
      }}
    >
      <Selecao label="Volta na" value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)}>
        {DIAS.map((nome, indice) => (
          <option key={nome} value={indice + 1}>
            {nome}
          </option>
        ))}
      </Selecao>
      <Campo label="Hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
      <Selecao label="Serviço" value={servicoIds} onChange={(e) => setServicoIds(e.target.value)} className="sm:col-span-2">
        <option value="">Escolha</option>
        {servicos.map((servico) => (
          <option key={servico.id} value={servico.id}>
            {servico.nome}
          </option>
        ))}
      </Selecao>
      <div className="sm:col-span-2 flex flex-col gap-3">
        <Falha>{erro}</Falha>
        {proxima && (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
            Próxima: {formatarDiaLongo(proxima)} · {formatarHorario(proxima)}
          </p>
        )}
        <Button type="submit" variant="outline" ocupado={ocupado} className="self-start">
          Marcar recorrência
        </Button>
      </div>
    </form>
  )
}

export function Avaliacoes() {
  const api = useApi()
  const [lista, setLista] = useState<Array<{ id: string; nome: string; nota: number; texto: string; publicada: boolean }> | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    void api.chamar<{ avaliacoes: Array<{ id: string; nome: string; nota: number; texto: string; publicada: boolean }> }>(
      '/api/painel/avaliacoes?publicada=false',
    ).then((resposta) => setLista(resposta.dados?.avaliacoes ?? []))
  }, [api, versao])

  const pendentes = lista ?? []

  return (
    <Bloco titulo="Avaliações" descricao="Publicar manda o texto para a seção de avaliações do site.">
      {lista === null ? (
        <EsqueletoLista linhas={2} />
      ) : pendentes.length === 0 ? (
        <Vazio>Nenhuma avaliação esperando.</Vazio>
      ) : (
        <ul className="list">
          {pendentes.map((item) => (
            <li key={item.id} className="list-row">
              <div className="list-col-grow">
                <p className="text-ink">{item.nome}</p>
                <p className="text-sm text-muted">
                  {'★'.repeat(item.nota)} {item.texto}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                ocupado={ocupado === item.id}
                onClick={async () => {
                  setErro(null)
                  setOcupado(item.id)
                  const resposta = await api.chamar(`/api/painel/avaliacoes/${item.id}/publicar`, { metodo: 'POST', corpo: {} })
                  setOcupado(null)
                  if (!resposta.ok) {
                    setErro('Não publicou.')
                    return
                  }
                  setVersao((atual) => atual + 1)
                }}
              >
                Publicar
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3">
        <Falha>{erro}</Falha>
      </div>
    </Bloco>
  )
}
