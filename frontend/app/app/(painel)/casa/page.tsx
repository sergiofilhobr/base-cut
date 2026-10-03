'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { diaCivil, reaisParaCentavos, somarDias } from '@/app/lib/agenda'
import { useApi } from '../../sessao'
import { Button } from '../../ui/button'
import { Campo, Falha, Selecao } from '../../ui/campo'
import { Pagina, Vazio } from '../../ui/secao'
import { SoEquipe } from '../agenda/page'
import { Avaliacoes, Bloco, Campanha, FichaDaCasa, Planos, Produtos } from './blocos'
import { useEquipe } from '../eu'

type Barbeiro = { id: string; nome: string }
type Servico = { id: string; nome: string }

/**
 * Casa — o que não é o dia a dia da agenda: relatório e cupom, a equipe e a
 * comissão (só admin), a corrida do Run Club e a galeria.
 */
export default function CasaPage() {
  const equipe = useEquipe()
  const api = useApi()
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])

  async function recarregarBarbeiros() {
    const resposta = await api.chamar<{ barbeiros: Barbeiro[] }>('/api/barbeiros')
    setBarbeiros(resposta.dados?.barbeiros ?? [])
  }

  useEffect(() => {
    void api.chamar<{ barbeiros: Barbeiro[] }>('/api/barbeiros').then((r) => setBarbeiros(r.dados?.barbeiros ?? []))
    void api.chamar<{ servicos: Servico[] }>('/api/servicos').then((r) => setServicos(r.dados?.servicos ?? []))
  }, [api])

  if (!equipe) return <SoEquipe />
  const admin = equipe.papel === 'admin'

  return (
    <Pagina
      eyebrow={admin ? 'Admin' : 'Equipe'}
      titulo={
        <>
          A casa
          <br />
          <span className="text-muted">por dentro.</span>
        </>
      }
    >
      <Relatorio />
      <Cupom />
      <Produtos />
      <Planos />
      <Equipe barbeiros={barbeiros} admin={admin} aoMudar={recarregarBarbeiros} />
      <FichaDaCasa />
      <Avaliacoes />
      <Campanha />
      <RunClub />
      <Galeria servicos={servicos} />
    </Pagina>
  )
}

function Relatorio() {
  const api = useApi()
  const [de, setDe] = useState(somarDias(diaCivil(), -30))
  const [ate, setAte] = useState(diaCivil())
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)

  async function baixar(caminho: string, nome: string) {
    setErro(null)
    setOcupado(nome)
    const inicio = new Date(`${de}T00:00:00-03:00`).toISOString()
    const fim = new Date(`${somarDias(ate, 1)}T00:00:00-03:00`).toISOString()
    const ok = await api.baixar(`${caminho}?de=${encodeURIComponent(inicio)}&ate=${encodeURIComponent(fim)}`, nome)
    setOcupado(null)
    if (!ok) setErro('O relatório não saiu. Confira o período e a conta.')
  }

  return (
    <Bloco titulo="Relatório" descricao="Atendimentos, faturamento e repasse do período, em CSV.">
      <div className="grid gap-5 sm:grid-cols-2 max-w-md">
        <Campo label="De" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
        <Campo label="Até" type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="outline" ocupado={ocupado === 'relatorio.csv'} onClick={() => void baixar('/api/painel/relatorio.csv', 'relatorio.csv')}>
          Baixar relatório
        </Button>
        <Button variant="ghost" ocupado={ocupado === 'repasse.csv'} onClick={() => void baixar('/api/painel/repasse.csv', 'repasse.csv')}>
          Repasse por barbeiro
        </Button>
      </div>
      <div className="mt-3">
        <Falha>{erro}</Falha>
      </div>
    </Bloco>
  )
}

function Cupom() {
  const api = useApi()
  const [codigo, setCodigo] = useState('')
  const [desconto, setDesconto] = useState('10,00')
  const [erro, setErro] = useState<string | null>(null)
  const [ultimo, setUltimo] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const centavos = reaisParaCentavos(desconto)
    if (!codigo.trim() || centavos === null || centavos <= 0) {
      setErro('Código e valor em reais, como 10,00.')
      return
    }
    setErro(null)
    setOcupado(true)
    const resposta = await api.chamar('/api/painel/cupons', {
      metodo: 'POST',
      corpo: { codigo: codigo.trim().toUpperCase(), descontoCentavos: centavos },
    })
    setOcupado(false)
    if (!resposta.ok) {
      setErro('O cupom não entrou.')
      return
    }
    setUltimo(codigo.trim().toUpperCase())
    setCodigo('')
  }

  return (
    <Bloco titulo="Cupom" descricao="Desconto fixo em reais, aplicado no fechamento.">
      <form onSubmit={enviar} className="grid gap-5 sm:grid-cols-[1fr_8rem_auto] items-start max-w-xl" noValidate>
        <Campo label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="BASE10" className="[&_input]:uppercase" />
        <Campo label="Desconto" inputMode="decimal" value={desconto} onChange={(e) => setDesconto(e.target.value)} />
        <Button type="submit" variant="outline" ocupado={ocupado} className="sm:mt-[1.4rem]">
          Criar
        </Button>
      </form>
      <Falha>{erro}</Falha>
      {ultimo && !erro && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
          Último criado: {ultimo}
        </p>
      )}
    </Bloco>
  )
}

function Equipe({ barbeiros, admin, aoMudar }: { barbeiros: Barbeiro[]; admin: boolean; aoMudar: () => Promise<void> }) {
  const api = useApi()
  const [nome, setNome] = useState('')
  const [barbeiroId, setBarbeiroId] = useState('')
  const [percentual, setPercentual] = useState('40')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)

  return (
    <Bloco titulo="Equipe" descricao={admin ? 'Quem atende e qual percentual fica com cada um.' : 'Só o admin inclui barbeiro e grava comissão.'}>
      {barbeiros.length === 0 ? (
        <Vazio>Nenhum barbeiro ativo.</Vazio>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
              </tr>
            </thead>
            <tbody>
              {barbeiros.map((barbeiro) => (
                <tr key={barbeiro.id}>
                  <td>{barbeiro.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {admin && (
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={async (evento) => {
              evento.preventDefault()
              if (!nome.trim()) return
              setErro(null)
              setOcupado('incluir')
              const resposta = await api.chamar('/api/painel/barbeiros', { metodo: 'POST', corpo: { nome: nome.trim() } })
              setOcupado(null)
              if (!resposta.ok) {
                setErro('Não entrou. A conta precisa ser admin.')
                return
              }
              setNome('')
              await aoMudar()
            }}
          >
            <Campo label="Novo barbeiro" value={nome} onChange={(e) => setNome(e.target.value)} />
            <Button type="submit" variant="outline" ocupado={ocupado === 'incluir'} className="self-start">
              Incluir
            </Button>
          </form>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={async (evento) => {
              evento.preventDefault()
              const valor = Number(percentual)
              if (!barbeiroId || !Number.isFinite(valor) || valor < 0 || valor > 100) {
                setErro('Escolha o barbeiro e um percentual de 0 a 100.')
                return
              }
              setErro(null)
              setOcupado('comissao')
              const resposta = await api.chamar(`/api/painel/barbeiros/${barbeiroId}/comissao`, {
                metodo: 'PUT',
                corpo: { percentual: valor },
              })
              setOcupado(null)
              if (!resposta.ok) setErro('A comissão não gravou.')
            }}
          >
            <Selecao label="Comissão de" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
              <option value="">Escolha</option>
              {barbeiros.map((barbeiro) => (
                <option key={barbeiro.id} value={barbeiro.id}>
                  {barbeiro.nome}
                </option>
              ))}
            </Selecao>
            <Campo label="Percentual" inputMode="numeric" value={percentual} onChange={(e) => setPercentual(e.target.value)} ajuda="Parte do faturado que fica com o barbeiro." />
            <Button type="submit" variant="outline" ocupado={ocupado === 'comissao'} className="self-start">
              Gravar comissão
            </Button>
          </form>
        </div>
      )}
      <div className="mt-3">
        <Falha>{erro}</Falha>
      </div>
    </Bloco>
  )
}

type Inscrito = { clienteId: string; nome: string; telefone: string; presente: boolean; runClub: boolean }
type Evento = { id: string; nome: string; inicio: string; vagas: number }

function RunClub() {
  const api = useApi()
  const [nome, setNome] = useState('Base Run')
  const [inicio, setInicio] = useState('')
  const [vagas, setVagas] = useState('12')
  const [erro, setErro] = useState<string | null>(null)
  const [ultima, setUltima] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoId, setEventoId] = useState('')
  const [inscritos, setInscritos] = useState<Inscrito[]>([])
  const [checkin, setCheckin] = useState<string | null>(null)

  useEffect(() => {
    void api.chamar<{ eventos: Evento[] }>('/api/run').then((resposta) => {
      const lista = resposta.dados?.eventos ?? []
      setEventos(lista)
      setEventoId((atual) => atual || lista.at(-1)?.id || '')
    })
  }, [api, ultima])

  useEffect(() => {
    if (!eventoId) return
    let vivo = true
    void api.chamar<{ inscritos: Inscrito[] }>(`/api/painel/run/${eventoId}/inscritos`).then((resposta) => {
      if (vivo) setInscritos(resposta.dados?.inscritos ?? [])
    })
    return () => {
      vivo = false
    }
  }, [api, eventoId, checkin])

  return (
    <Bloco titulo="Run Club" descricao="Abre a corrida, vê quem entrou e faz o check-in — a tag fica na ficha.">
      <form
        className="grid gap-5 sm:grid-cols-[1fr_1fr_6rem_auto] items-start max-w-2xl"
        noValidate
        onSubmit={async (evento) => {
          evento.preventDefault()
          const quando = new Date(inicio)
          if (!nome.trim() || Number.isNaN(quando.getTime()) || Number(vagas) < 1) {
            setErro('Nome, data e pelo menos uma vaga.')
            return
          }
          setErro(null)
          setOcupado(true)
          const resposta = await api.chamar('/api/painel/run', {
            metodo: 'POST',
            corpo: { nome: nome.trim(), inicio: quando.toISOString(), vagas: Number(vagas) },
          })
          setOcupado(false)
          if (!resposta.ok) {
            setErro('A corrida não abriu.')
            return
          }
          setUltima(`${nome.trim()} · ${quando.toLocaleDateString('pt-BR')}`)
        }}
      >
        <Campo label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Campo label="Quando" type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        <Campo label="Vagas" inputMode="numeric" value={vagas} onChange={(e) => setVagas(e.target.value)} />
        <Button type="submit" variant="outline" ocupado={ocupado} className="sm:mt-[1.4rem]">
          Abrir
        </Button>
      </form>
      <Falha>{erro}</Falha>
      {ultima && !erro && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
          Aberta: {ultima}
        </p>
      )}
      {eventos.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          <Selecao
            label="Corrida"
            value={eventoId}
            onChange={(e) => {
              setInscritos([])
              setEventoId(e.target.value)
            }}
            className="max-w-md"
          >
            {eventos.map((evento) => (
              <option key={evento.id} value={evento.id}>
                {evento.nome}
              </option>
            ))}
          </Selecao>
          {inscritos.length === 0 ? (
            <Vazio>Ninguém inscrito nessa corrida.</Vazio>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {inscritos.map((pessoa) => (
                    <tr key={pessoa.clienteId}>
                      <td>
                        {pessoa.nome}
                        {pessoa.runClub || pessoa.presente ? <span className="text-muted"> · Run Club</span> : null}
                      </td>
                      <td className="font-mono text-xs">{pessoa.telefone}</td>
                      <td>
                        {pessoa.presente ? (
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Presente</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            ocupado={checkin === pessoa.clienteId}
                            onClick={async () => {
                              setCheckin(pessoa.clienteId)
                              await api.chamar(`/api/painel/run/${eventoId}/checkin`, {
                                metodo: 'POST',
                                corpo: { clienteId: pessoa.clienteId },
                              })
                              setCheckin(null)
                              const resposta = await api.chamar<{ inscritos: Inscrito[] }>(
                                `/api/painel/run/${eventoId}/inscritos`,
                              )
                              setInscritos(resposta.dados?.inscritos ?? [])
                            }}
                          >
                            Check-in
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Bloco>
  )
}

function Galeria({ servicos }: { servicos: Servico[] }) {
  const api = useApi()
  const [src, setSrc] = useState('')
  const [alt, setAlt] = useState('')
  const [servicoId, setServicoId] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [ultima, setUltima] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  return (
    <Bloco titulo="Galeria" descricao="Publica uma foto já hospedada, com legenda e o serviço que mostra.">
      <form
        className="grid gap-5 sm:grid-cols-2 max-w-2xl"
        noValidate
        onSubmit={async (evento) => {
          evento.preventDefault()
          if (!src.trim() || !alt.trim()) {
            setErro('Caminho da foto e legenda.')
            return
          }
          setErro(null)
          setOcupado(true)
          const resposta = await api.chamar('/api/painel/galeria', {
            metodo: 'POST',
            corpo: { src: src.trim(), alt: alt.trim(), servicoId },
          })
          setOcupado(false)
          if (!resposta.ok) {
            setErro('A foto não entrou.')
            return
          }
          setUltima(alt.trim())
          setSrc('')
          setAlt('')
        }}
      >
        <Campo label="Caminho da foto" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="/assets/images/corte.jpg" />
        <Campo label="Legenda" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <Selecao label="Serviço" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
          <option value="">Sem serviço</option>
          {servicos.map((servico) => (
            <option key={servico.id} value={servico.id}>
              {servico.nome}
            </option>
          ))}
        </Selecao>
        <div className="flex flex-col gap-3 sm:mt-[1.4rem]">
          <Button type="submit" variant="outline" ocupado={ocupado} className="self-start">
            Publicar
          </Button>
        </div>
      </form>
      <Falha>{erro}</Falha>
      {ultima && !erro && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
          Publicada: {ultima}
        </p>
      )}
    </Bloco>
  )
}
