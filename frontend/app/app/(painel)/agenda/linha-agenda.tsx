'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { formatarHorario, formatarPreco, reaisParaCentavos, rotuloEstado } from '@/app/lib/agenda'
import { useApi } from '../../sessao'
import { Button, cn } from '../../ui/button'
import { Caixa, Campo, Falha, Selecao } from '../../ui/campo'
import { Modal } from '../../ui/modal'
import { Estado } from '../../ui/secao'

export type LinhaDaAgenda = {
  id: string
  clienteId: string
  nome: string
  telefone: string
  inicio: string
  fim: string
  estado: string
  criadoEm?: string
  servicos: Array<{ id: string | null; nome: string; duracaoMinutos?: number; precoCentavos: number }>
}

export type ServicoBasico = { id: string; nome: string }

type Produto = { id: string; nome: string; precoCentavos: number; estoque: number }
type Sinal = { id: string; meio: string; valorCentavos: number; situacao: string } | null

const ERROS: Record<string, string> = {
  horario_indisponivel: 'Esse horário já está tomado.',
  estado_invalido: 'Esse horário não está mais confirmado.',
  pedido_invalido: 'Confira a data e a hora.',
  servico_indisponivel: 'Um dos serviços não está mais no catálogo.',
  sem_estoque: 'Um produto não tem estoque para essa quantidade.',
  valor_invalido: 'Confira desconto, gorjeta e o valor do sinal.',
}

/**
 * Uma linha da agenda da casa. Hora, nome e ações em `list-row`;
 * o que é irreversível abre `modal`. Fechar grava o dinheiro.
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
  const [cancelar, setCancelar] = useState(false)
  const [fechar, setFechar] = useState(false)
  const [sinalAberto, setSinalAberto] = useState(false)
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
      return false
    }
    setCancelar(false)
    setMais(false)
    await aoMudar()
    return true
  }

  const vivo = linha.estado === 'confirmado'

  return (
    <li className={cn('list-row', !vivo && 'opacity-80')}>
      <div>
        <p className="font-display font-black text-2xl leading-none tabular-nums text-ink">
          {formatarHorario(linha.inicio)}
        </p>
        <p className="mt-1 font-mono text-[10px] font-normal tracking-[0.15em] text-muted">
          até {formatarHorario(linha.fim)}
        </p>
      </div>
      <div className="list-col-grow min-w-0">
        <p className="text-base text-ink truncate">{linha.nome}</p>
        <p className="mt-0.5 text-sm text-muted">
          {linha.servicos.map((servico) => servico.nome).join(' + ') || 'Sem serviço'}
        </p>
        <p className="mt-1 font-mono text-[11px] tracking-[0.08em] text-muted">
          <a href={`tel:${linha.telefone}`} className="hover:text-ink">
            {linha.telefone}
          </a>
        </p>
        {vivo && (
          <div className="join join-vertical sm:join-horizontal mt-3 flex-wrap">
            <Button size="sm" className="join-item" onClick={() => setFechar(true)}>
              Fechar atendimento
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="join-item"
              ocupado={ocupado === 'falta'}
              onClick={() => void agir('falta', `/api/painel/agendamentos/${linha.id}/estado`, { estado: 'falta' })}
            >
              Falta
            </Button>
            <Button size="sm" variant="quiet" className="join-item" onClick={() => setCancelar(true)}>
              Cancelar
            </Button>
            <Button size="sm" variant="outline" className="join-item" onClick={() => setSinalAberto(true)}>
              Sinal
            </Button>
            {!compacta && (
              <Button
                size="sm"
                variant="ghost"
                className="join-item"
                aria-expanded={mais}
                onClick={() => setMais((atual) => !atual)}
              >
                {mais ? 'Menos' : 'Mais'}
              </Button>
            )}
          </div>
        )}
        <div className="mt-2">
          <Estado estado={linha.estado} rotulo={rotuloEstado(linha.estado)} />
        </div>
        {vivo && mais && (
          <div className="mt-5 grid gap-8 sm:grid-cols-2">
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
          <div className="mt-3">
            <Falha>{erro}</Falha>
          </div>
        )}

      <Modal aberto={cancelar} titulo="Cancelar horário" onFechar={() => setCancelar(false)}>
        <p className="text-sm text-ink">Cancelar o horário de {linha.nome}? Não tem volta.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant="outline"
            ocupado={ocupado === 'cancelar'}
            onClick={() =>
              void agir('cancelar', `/api/painel/agendamentos/${linha.id}/estado`, {
                estado: 'cancelado_pela_casa',
              }).then((ok) => {
                if (ok) setCancelar(false)
              })
            }
          >
            Sim, cancelar
          </Button>
          <Button variant="quiet" onClick={() => setCancelar(false)}>
            Não
          </Button>
        </div>
      </Modal>

      {fechar && (
        <FecharModal
          linha={linha}
          onFechar={() => setFechar(false)}
          aoMudar={aoMudar}
        />
      )}
      {sinalAberto && <SinalModal linha={linha} onFechar={() => setSinalAberto(false)} />}
      </div>
    </li>
  )
}

function FecharModal({
  linha,
  onFechar,
  aoMudar,
}: {
  linha: LinhaDaAgenda
  onFechar: () => void
  aoMudar: () => Promise<void>
}) {
  const api = useApi()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [vendas, setVendas] = useState<Array<{ produtoId: string; quantidade: string }>>([])
  const [cupom, setCupom] = useState('')
  const [desconto, setDesconto] = useState(0)
  const [gorjeta, setGorjeta] = useState('')
  const [meio, setMeio] = useState<'pix' | 'cartao' | 'dinheiro'>('pix')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [comprovante, setComprovante] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    void api.chamar<{ produtos: Produto[] }>('/api/painel/produtos').then((resposta) => {
      setProdutos(resposta.dados?.produtos ?? [])
    })
  }, [api])

  const brutoServicos = linha.servicos.reduce((soma, item) => soma + item.precoCentavos, 0)
  const brutoProdutos = vendas.reduce((soma, venda) => {
    const produto = produtos.find((item) => item.id === venda.produtoId)
    const quantidade = Number(venda.quantidade)
    if (!produto || !Number.isFinite(quantidade) || quantidade <= 0) return soma
    return soma + produto.precoCentavos * quantidade
  }, 0)
  const bruto = brutoServicos + brutoProdutos
  const gorjetaCentavos = reaisParaCentavos(gorjeta || '0') ?? 0
  const total = Math.max(0, bruto - desconto) + Math.max(0, gorjetaCentavos)

  async function aplicarCupom() {
    setErro(null)
    if (!cupom.trim()) {
      setDesconto(0)
      return
    }
    const resposta = await api.chamar<{ totalCentavos?: number; erro?: string }>('/api/cupons/aplicar', {
      metodo: 'POST',
      corpo: { codigo: cupom.trim().toUpperCase(), totalCentavos: bruto },
    })
    if (!resposta.ok || typeof resposta.dados?.totalCentavos !== 'number') {
      setDesconto(0)
      setErro('Esse cupom não entra nesse valor.')
      return
    }
    setDesconto(bruto - resposta.dados.totalCentavos)
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    const produtosPedido = vendas
      .filter((venda) => venda.produtoId && Number(venda.quantidade) > 0)
      .map((venda) => ({ produtoId: venda.produtoId, quantidade: Number(venda.quantidade) }))
    if (gorjetaCentavos < 0) {
      setErro(ERROS.valor_invalido)
      return
    }
    setOcupado(true)
    const resposta = await api.chamar<{ comprovante?: string; erro?: string }>('/api/painel/atendimentos', {
      metodo: 'POST',
      corpo: {
        agendamentoId: linha.id,
        clienteId: linha.clienteId,
        servicos: linha.servicos.map((servico) => ({ nome: servico.nome, precoCentavos: servico.precoCentavos })),
        produtos: produtosPedido,
        descontoCentavos: desconto,
        gorjetaCentavos,
        pagamento: total > 0 ? { meio, valorCentavos: total } : null,
      },
    })
    setOcupado(false)
    if (!resposta.ok || !resposta.dados?.comprovante) {
      setErro(ERROS[resposta.dados?.erro ?? ''] ?? 'O atendimento não fechou.')
      return
    }
    setComprovante(resposta.dados.comprovante)
    await aoMudar()
  }

  async function copiar() {
    if (!comprovante) return
    await navigator.clipboard.writeText(comprovante)
    setCopiado(true)
  }

  function enviarWhatsapp() {
    if (!comprovante) return
    const digitos = linha.telefone.replace(/\D/g, '')
    const numero = digitos.startsWith('55') ? digitos : `55${digitos}`
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(comprovante)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <Modal aberto titulo={`Fechar · ${linha.nome}`} onFechar={onFechar}>
      {comprovante ? (
        <div className="flex flex-col gap-4">
          <pre className="font-mono text-xs whitespace-pre-wrap text-ink">{comprovante}</pre>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void copiar()}>
              {copiado ? 'Copiado' : 'Copiar'}
            </Button>
            <Button variant="outline" onClick={enviarWhatsapp}>
              Enviar
            </Button>
            <Button variant="quiet" onClick={onFechar}>
              Fechar
            </Button>
          </div>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={enviar} noValidate>
          <ul className="list">
            {linha.servicos.map((servico) => (
              <li key={`${servico.id}-${servico.nome}`} className="list-row">
                <span className="list-col-grow text-sm text-ink">{servico.nome}</span>
                <span className="tabular-nums text-sm text-muted">{formatarPreco(servico.precoCentavos)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3">
            {vendas.map((venda, indice) => (
              <div key={indice} className="grid grid-cols-[minmax(0,1fr)_5rem] gap-3">
                <Selecao
                  label="Produto"
                  value={venda.produtoId}
                  onChange={(evento) =>
                    setVendas((atual) =>
                      atual.map((item, i) => (i === indice ? { ...item, produtoId: evento.target.value } : item)),
                    )
                  }
                >
                  <option value="">Escolha</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} · {formatarPreco(produto.precoCentavos)} · {produto.estoque}
                    </option>
                  ))}
                </Selecao>
                <Campo
                  label="Qtd"
                  inputMode="numeric"
                  value={venda.quantidade}
                  onChange={(evento) =>
                    setVendas((atual) =>
                      atual.map((item, i) => (i === indice ? { ...item, quantidade: evento.target.value } : item)),
                    )
                  }
                />
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => setVendas((atual) => [...atual, { produtoId: '', quantidade: '1' }])}
            >
              Adicionar produto
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] items-start">
            <Campo
              label="Cupom"
              value={cupom}
              onChange={(evento) => setCupom(evento.target.value)}
              placeholder="BASE10"
              className="[&_input]:uppercase"
            />
            <Button type="button" variant="outline" className="sm:mt-[1.4rem]" onClick={() => void aplicarCupom()}>
              Aplicar
            </Button>
          </div>
          {desconto > 0 && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Desconto {formatarPreco(desconto)}
            </p>
          )}
          <Campo label="Gorjeta" inputMode="decimal" value={gorjeta} onChange={(evento) => setGorjeta(evento.target.value)} placeholder="0,00" />
          <Selecao label="Pagamento" value={meio} onChange={(evento) => setMeio(evento.target.value as typeof meio)}>
            <option value="pix">Pix</option>
            <option value="cartao">Cartão</option>
            <option value="dinheiro">Dinheiro</option>
          </Selecao>
          <p className="font-display font-black text-2xl tabular-nums text-ink">{formatarPreco(total)}</p>
          <Falha>{erro}</Falha>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" ocupado={ocupado} disabled={linha.servicos.length === 0}>
              Gravar
            </Button>
            <Button type="button" variant="quiet" onClick={onFechar}>
              Voltar
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function SinalModal({ linha, onFechar }: { linha: LinhaDaAgenda; onFechar: () => void }) {
  const api = useApi()
  const [sinal, setSinal] = useState<Sinal>(null)
  const [valor, setValor] = useState('20,00')
  const [meio, setMeio] = useState<'pix' | 'cartao'>('pix')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    void api.chamar<{ sinal: Sinal }>(`/api/painel/sinais?agendamentoId=${encodeURIComponent(linha.id)}`).then((resposta) => {
      setSinal(resposta.dados?.sinal ?? null)
    })
  }, [api, linha.id])

  async function pedir(evento: FormEvent) {
    evento.preventDefault()
    const centavos = reaisParaCentavos(valor)
    if (centavos === null || centavos <= 0) {
      setErro(ERROS.valor_invalido)
      return
    }
    setErro(null)
    setOcupado(true)
    const resposta = await api.chamar<{ erro?: string; pagamentoId?: string }>('/api/painel/sinais', {
      metodo: 'POST',
      corpo: { agendamentoId: linha.id, clienteId: linha.clienteId, meio, valorCentavos: centavos },
    })
    setOcupado(false)
    if (!resposta.ok) {
      setErro(ERROS[resposta.dados?.erro ?? ''] ?? 'O sinal não saiu.')
      return
    }
    const atual = await api.chamar<{ sinal: Sinal }>(`/api/painel/sinais?agendamentoId=${encodeURIComponent(linha.id)}`)
    setSinal(atual.dados?.sinal ?? null)
  }

  return (
    <Modal aberto titulo={`Sinal · ${linha.nome}`} onFechar={onFechar}>
      {sinal && (
        <p className="mb-4 text-sm text-ink">
          {formatarPreco(sinal.valorCentavos)} no {sinal.meio} · {sinal.situacao === 'pago' ? 'pago' : 'pendente'}
        </p>
      )}
      <form className="flex flex-col gap-4" onSubmit={pedir} noValidate>
        <Campo label="Valor" inputMode="decimal" value={valor} onChange={(evento) => setValor(evento.target.value)} />
        <Selecao label="Meio" value={meio} onChange={(evento) => setMeio(evento.target.value as typeof meio)}>
          <option value="pix">Pix</option>
          <option value="cartao">Cartão</option>
        </Selecao>
        <Falha>{erro}</Falha>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="outline" ocupado={ocupado}>
            Pedir sinal
          </Button>
          <Button type="button" variant="quiet" onClick={onFechar}>
            Voltar
          </Button>
        </div>
      </form>
    </Modal>
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
