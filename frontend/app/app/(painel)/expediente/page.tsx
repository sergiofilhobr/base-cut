'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { formatarPreco, reaisParaCentavos } from '@/app/lib/agenda'
import { useApi } from '../../sessao'
import { Button } from '../../ui/button'
import { Campo, Falha, Selecao } from '../../ui/campo'
import { EsqueletoLista, Pagina, Secao, Vazio } from '../../ui/secao'
import { SoEquipe } from '../agenda/page'
import { useEquipe } from '../eu'

type Faixa = { diaSemana: number; inicio: string; fim: string }
type Barbeiro = { id: string; nome: string }
type DiaDaSemana = { diaSemana: number; atende: boolean; inicio: string; fim: string }

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

/** Expediente — as faixas recorrentes da semana, uma por dia. */
export default function ExpedientePage() {
  const equipe = useEquipe()
  const api = useApi()
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([])
  const [barbeiroId, setBarbeiroId] = useState('')
  const [semana, setSemana] = useState<DiaDaSemana[] | null>(null)
  const [semanaDe, setSemanaDe] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [salvoEm, setSalvoEm] = useState<string | null>(null)

  useEffect(() => {
    void api.chamar<{ barbeiros: Barbeiro[] }>('/api/barbeiros').then((r) => setBarbeiros(r.dados?.barbeiros ?? []))
  }, [api])

  useEffect(() => {
    const filtro = barbeiroId ? `?barbeiroId=${encodeURIComponent(barbeiroId)}` : ''
    void api.chamar<{ faixas: Faixa[] }>(`/api/expediente${filtro}`).then((resposta) => {
      setSemanaDe(barbeiroId)
      if (!resposta.ok || !resposta.dados) {
        setErro(resposta.status === 401 ? 'A conta precisa ser da equipe.' : 'O expediente não abriu.')
        setSemana([])
        return
      }
      setErro(null)
      const faixas = resposta.dados.faixas
      setSemana(
        DIAS.map((_, indice) => {
          const faixa = faixas.find((item) => item.diaSemana === indice + 1)
          return {
            diaSemana: indice + 1,
            atende: Boolean(faixa),
            inicio: faixa?.inicio ?? '09:00',
            fim: faixa?.fim ?? '19:00',
          }
        }),
      )
    })
  }, [api, barbeiroId])

  if (!equipe) return <SoEquipe />

  function mudar(diaSemana: number, dados: Partial<DiaDaSemana>) {
    setSemana((atual) => atual?.map((dia) => (dia.diaSemana === diaSemana ? { ...dia, ...dados } : dia)) ?? atual)
    setSalvoEm(null)
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    if (!semana) return
    const invalido = semana.find((dia) => dia.atende && dia.inicio >= dia.fim)
    if (invalido) {
      setErro(`${DIAS[invalido.diaSemana - 1]}: o fim precisa vir depois do começo.`)
      return
    }
    setErro(null)
    setOcupado(true)
    const faixas = semana
      .filter((dia) => dia.atende)
      .map(({ diaSemana, inicio, fim }) => ({ diaSemana, inicio, fim }))
    const resposta = await api.chamar('/api/expediente', {
      metodo: 'PUT',
      corpo: { faixas, barbeiroId: barbeiroId || undefined },
    })
    setOcupado(false)
    if (!resposta.ok) {
      setErro('Não foi possível gravar o expediente.')
      return
    }
    setSalvoEm(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
  }

  return (
    <Pagina
      eyebrow="Semana a semana"
      titulo={
        <>
          Expediente
          <br />
          <span className="text-muted">da casa.</span>
        </>
      }
    >
      {barbeiros.length > 1 && (
        <Selecao label="Profissional" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)} className="max-w-xs">
          <option value="">Primeiro da casa</option>
          {barbeiros.map((barbeiro) => (
            <option key={barbeiro.id} value={barbeiro.id}>
              {barbeiro.nome}
            </option>
          ))}
        </Selecao>
      )}

      <Secao
        titulo="Dias e horas"
        descricao="Os horários livres do site nascem daqui. Fora dessas faixas ninguém marca."
      >
        {semana === null || semanaDe !== barbeiroId ? (
          <EsqueletoLista linhas={7} />
        ) : (
          <form onSubmit={salvar} noValidate>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Dia</th>
                    <th>Atende</th>
                    <th>Das</th>
                    <th>Às</th>
                  </tr>
                </thead>
                <tbody>
                  {semana.map((dia) => (
                    <tr key={dia.diaSemana}>
                      <td className="text-ink">{DIAS[dia.diaSemana - 1]}</td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle"
                          aria-label={`${DIAS[dia.diaSemana - 1]} atende`}
                          checked={dia.atende}
                          onChange={(e) => mudar(dia.diaSemana, { atende: e.target.checked })}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          value={dia.inicio}
                          disabled={!dia.atende}
                          aria-label={`${DIAS[dia.diaSemana - 1]} começa`}
                          onChange={(e) => mudar(dia.diaSemana, { inicio: e.target.value })}
                          className="input input-sm w-28"
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          value={dia.fim}
                          disabled={!dia.atende}
                          aria-label={`${DIAS[dia.diaSemana - 1]} termina`}
                          onChange={(e) => mudar(dia.diaSemana, { fim: e.target.value })}
                          className="input input-sm w-28"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button type="submit" ocupado={ocupado}>
                Salvar expediente
              </Button>
              <Falha>{erro}</Falha>
              {salvoEm && !erro && (
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
                  Gravado às {salvoEm}
                </span>
              )}
            </div>
          </form>
        )}
      </Secao>
      <Descontos />
    </Pagina>
  )
}

type FaixaDesconto = { id: string; diaSemana: number; inicio: string; fim: string; descontoCentavos: number }

function Descontos() {
  const api = useApi()
  const [faixas, setFaixas] = useState<FaixaDesconto[]>([])
  const [diaSemana, setDiaSemana] = useState('2')
  const [inicio, setInicio] = useState('14:00')
  const [fim, setFim] = useState('16:00')
  const [desconto, setDesconto] = useState('15,00')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    void api.chamar<{ horarios: FaixaDesconto[] }>('/api/painel/horarios-desconto').then((resposta) => {
      setFaixas(resposta.dados?.horarios ?? [])
    })
  }, [api, versao])

  return (
    <Secao titulo="Horário com desconto" descricao="Uma faixa da semana sai mais barata. O valor é fixo, em reais.">
      {faixas.length === 0 ? (
        <Vazio>Nenhuma faixa ainda.</Vazio>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Faixa</th>
                <th>Desconto</th>
              </tr>
            </thead>
            <tbody>
              {faixas.map((faixa) => (
                <tr key={faixa.id}>
                  <td>{DIAS[faixa.diaSemana - 1]}</td>
                  <td>
                    {faixa.inicio}–{faixa.fim}
                  </td>
                  <td className="tabular-nums">{formatarPreco(Number(faixa.descontoCentavos))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form
        className="mt-6 grid gap-4 sm:grid-cols-2 max-w-xl"
        noValidate
        onSubmit={async (evento) => {
          evento.preventDefault()
          const centavos = reaisParaCentavos(desconto)
          if (!inicio || !fim || inicio >= fim || centavos === null || centavos <= 0) {
            setErro('Faixa válida e um desconto em reais.')
            return
          }
          setErro(null)
          setOcupado(true)
          const resposta = await api.chamar('/api/painel/horarios-desconto', {
            metodo: 'POST',
            corpo: { diaSemana: Number(diaSemana), inicio, fim, descontoCentavos: centavos },
          })
          setOcupado(false)
          if (!resposta.ok) {
            setErro('A faixa não entrou.')
            return
          }
          setVersao((atual) => atual + 1)
        }}
      >
        <Selecao label="Dia" value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)}>
          {DIAS.map((nome, indice) => (
            <option key={nome} value={indice + 1}>
              {nome}
            </option>
          ))}
        </Selecao>
        <Campo label="Desconto" inputMode="decimal" value={desconto} onChange={(e) => setDesconto(e.target.value)} />
        <Campo label="Das" type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        <Campo label="Às" type="time" value={fim} onChange={(e) => setFim(e.target.value)} />
        <div className="sm:col-span-2 flex flex-col gap-3">
          <Falha>{erro}</Falha>
          <Button type="submit" variant="outline" ocupado={ocupado} className="self-start">
            Gravar faixa
          </Button>
        </div>
      </form>
    </Secao>
  )
}
